"""
Download headshots from Airtable attachments.

This script downloads the largest available version of headshot images
and stores them locally in public/images/headshots/.

Run separately from the main data update pipeline - only needed when
headshots change or new entities are added.

Usage:
    uv run python/04-download_headshots.py [--force]

Options:
    --force    Re-download all headshots even if they already exist
"""

import ast
import sys
from pathlib import Path

import pandas as pd
import requests

# Configuration
INPUT_PATH = Path("data") / "input" / "input_entities.pkl"
OUTPUT_DIR = Path("public") / "images" / "headshots"
TIMEOUT = 30  # seconds


def parse_airtable_attachment(attachment_data) -> dict | None:
    """
    Parse Airtable attachment data and extract the best image URL.

    Handles both string representations and native Python objects (from pickle).

    Returns dict with 'url', 'filename', and 'extension' or None if invalid.
    """
    if attachment_data is None or (isinstance(attachment_data, float) and pd.isna(attachment_data)):
        return None

    try:
        # If it's already a list (from pickle), use it directly
        if isinstance(attachment_data, list):
            attachments = attachment_data
        elif isinstance(attachment_data, str):
            if attachment_data == "nan" or not attachment_data:
                return None
            # Parse the string representation of the list
            attachments = ast.literal_eval(attachment_data)
        else:
            return None

        if not attachments or not isinstance(attachments, list):
            return None

        # Take the first attachment (usually there's only one)
        attachment = attachments[0]

        # Prefer the 'full' thumbnail (highest quality available)
        # Fall back to 'large', then the main URL
        thumbnails = attachment.get("thumbnails", {})

        if "full" in thumbnails and thumbnails["full"].get("url"):
            url = thumbnails["full"]["url"]
        elif "large" in thumbnails and thumbnails["large"].get("url"):
            url = thumbnails["large"]["url"]
        else:
            url = attachment.get("url")

        if not url:
            return None

        # Determine file extension from original filename or type
        original_filename = attachment.get("filename", "")
        mime_type = attachment.get("type", "")

        # Try to get extension from filename first
        if original_filename and "." in original_filename:
            extension = original_filename.rsplit(".", 1)[-1].lower()
        elif mime_type:
            # Map MIME types to extensions
            mime_to_ext = {
                "image/png": "png",
                "image/jpeg": "jpg",
                "image/jpg": "jpg",
                "image/gif": "gif",
                "image/webp": "webp",
            }
            extension = mime_to_ext.get(mime_type, "jpg")
        else:
            extension = "jpg"  # Default fallback

        return {
            "url": url,
            "filename": original_filename,
            "extension": extension,
        }

    except (ValueError, SyntaxError, KeyError, TypeError) as e:
        print(f"  Warning: Could not parse attachment: {e}")
        return None


def download_image(url: str, output_path: Path) -> bool:
    """
    Download an image from URL to the specified path.

    Returns True if successful, False otherwise.
    """
    try:
        response = requests.get(url, timeout=TIMEOUT, stream=True)
        response.raise_for_status()

        # Verify it's actually an image
        content_type = response.headers.get("content-type", "")
        if not content_type.startswith("image/"):
            print(f"  Warning: URL did not return an image (got {content_type})")
            return False

        # Write to file
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        return True

    except requests.exceptions.RequestException as e:
        print(f"  Error downloading: {e}")
        return False


def get_existing_headshot(entity: str, output_dir: Path) -> Path | None:
    """
    Check if a headshot already exists for the given entity.

    Returns the path if found, None otherwise.
    """
    # Check for common image extensions
    for ext in ["jpg", "jpeg", "png", "gif", "webp"]:
        path = output_dir / f"{entity}.{ext}"
        if path.exists():
            return path
    return None


def main(force: bool = False):
    """Main function to download all headshots."""

    print("📸 Headshot Download Script")
    print("=" * 50)

    # Check input file exists
    if not INPUT_PATH.exists():
        print(f"\n❌ Error: Input file not found: {INPUT_PATH}")
        print("   Run '01-fetch_from_airtable.py' first.")
        sys.exit(1)

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load data
    df = pd.read_pickle(INPUT_PATH)

    # Check if headshot column exists
    if "head_of_entity_headshot" not in df.columns:
        print("\n❌ Error: 'head_of_entity_headshot' column not found in data.")
        print("   Make sure this column is included in the Airtable fetch.")
        sys.exit(1)

    # Filter to entities with headshots
    entities_with_headshots = df[df["head_of_entity_headshot"].notna()].copy()
    total = len(entities_with_headshots)

    print(f"\nFound {total} entities with headshot attachments")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Force re-download: {force}")
    print()

    # Stats
    downloaded = 0
    skipped = 0
    failed = 0

    for _, row in entities_with_headshots.iterrows():
        entity = row["entity"]
        attachment_str = row["head_of_entity_headshot"]

        print(f"Processing: {entity}")

        # Check if already exists (unless force mode)
        if not force:
            existing = get_existing_headshot(entity, OUTPUT_DIR)
            if existing:
                print(f"  ⏭️  Already exists: {existing.name}")
                skipped += 1
                continue

        # Parse attachment
        attachment = parse_airtable_attachment(attachment_str)
        if not attachment:
            print("  ⚠️  No valid attachment found")
            failed += 1
            continue

        # Download
        output_path = OUTPUT_DIR / f"{entity}.{attachment['extension']}"
        print(f"  ⬇️  Downloading to {output_path.name}...")

        if download_image(attachment["url"], output_path):
            file_size = output_path.stat().st_size / 1024  # KB
            print(f"  ✅ Downloaded ({file_size:.1f} KB)")
            downloaded += 1
        else:
            failed += 1

    # Summary
    print()
    print("=" * 50)
    print("📊 Summary:")
    print(f"   Downloaded: {downloaded}")
    print(f"   Skipped (existing): {skipped}")
    print(f"   Failed: {failed}")
    print(f"   Total processed: {downloaded + skipped + failed}")

    if failed > 0:
        print(f"\n⚠️  {failed} headshots could not be downloaded.")
        print(
            "   Airtable attachment URLs expire - run this script soon after fetching data."
        )


if __name__ == "__main__":
    force_mode = "--force" in sys.argv
    main(force=force_mode)
