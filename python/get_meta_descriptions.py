import re
from pathlib import Path

import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

# Constants
SKIP_REDOWNLOAD = True  # Set to False to redownload all files
REQUEST_TIMEOUT = 30  # Timeout for HTTP requests in seconds
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}


def download_html(url, filepath):
    """Download HTML content from URL and save to file."""
    try:
        response = requests.get(url, headers=REQUEST_HEADERS, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(response.text)

        return True, None
    except Exception as e:
        return False, str(e)


def extract_meta_description(html_content):
    """Extract meta description from HTML content."""
    try:
        soup = BeautifulSoup(html_content, "html.parser")

        # Look for meta description tag
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc and hasattr(meta_desc, "attrs"):
            content = meta_desc.attrs.get("content")
            if content and isinstance(content, str):
                return content.strip()

        # Alternative: look for property="description"
        meta_desc = soup.find("meta", attrs={"property": "description"})
        if meta_desc and hasattr(meta_desc, "attrs"):
            content = meta_desc.attrs.get("content")
            if content and isinstance(content, str):
                return content.strip()

        # Alternative: look for og:description
        meta_desc = soup.find("meta", attrs={"property": "og:description"})
        if meta_desc and hasattr(meta_desc, "attrs"):
            content = meta_desc.attrs.get("content")
            if content and isinstance(content, str):
                return content.strip()

        return None
    except Exception:
        return None


def process_entity(row, download_folder, download_stats, extraction_stats):
    """Process a single entity: download HTML and extract meta description."""
    entity_code = row["entity"]
    entity_url = row["entity_link"]

    # Create filename using entity code
    filename = f"{entity_code}.html"
    filepath = download_folder / filename

    # Initialize results
    html_downloaded = False
    download_status = ""
    meta_description = ""

    # Skip if file exists and SKIP_REDOWNLOAD is True
    if SKIP_REDOWNLOAD:
        download_status = "skipped (already exists)"
        download_stats["skipped"] += 1
        html_downloaded = True
    else:
        # Download the HTML
        success, error = download_html(entity_url, filepath)

        if success:
            html_downloaded = True
            download_status = "success"
            download_stats["success"] += 1
        else:
            html_downloaded = False
            download_status = f"failed: {error}"
            download_stats["failed"] += 1

    # Extract meta description if file exists
    if filepath.exists():
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                html_content = f.read()

            extracted_desc = extract_meta_description(html_content)

            if extracted_desc:
                meta_description = extracted_desc
                extraction_stats["success"] += 1
            else:
                meta_description = "No meta description found"
                extraction_stats["failed"] += 1

        except Exception as e:
            meta_description = f"Error reading file: {str(e)}"
            extraction_stats["failed"] += 1
    else:
        meta_description = "No HTML file available"
        extraction_stats["no_file"] += 1

    return html_downloaded, download_status, meta_description


data_folder = Path("data")
input_path = data_folder / "input" / "input_entities.csv"
download_folder = data_folder / "downloads" / "entity_pages"

df = pd.read_csv(input_path)

# Initialize tracking lists
html_downloaded_list = []
download_status_list = []
meta_description_list = []

# Initialize statistics
download_stats = {"success": 0, "skipped": 0, "failed": 0}
extraction_stats = {"success": 0, "failed": 0, "no_file": 0}

# Process entities with progress bar
print("\nProcessing entities...")
for _, row in tqdm(
    df.iterrows(),
    total=len(df),
    desc="Processing entities",
):
    html_downloaded, download_status, meta_description = process_entity(
        row, download_folder, download_stats, extraction_stats
    )

    html_downloaded_list.append(html_downloaded)
    download_status_list.append(download_status)
    meta_description_list.append(meta_description)

# Add results to the filtered dataframe
df = df.copy()
df["html_downloaded"] = html_downloaded_list
df["download_status"] = download_status_list
df["meta_description"] = meta_description_list

# Merge back with original dataframe
df = df.merge(
    df[["entity", "html_downloaded", "download_status", "meta_description"]],
    on="entity",
    how="left",
)

# Fill NaN values for entities without links
df["html_downloaded"] = df["html_downloaded"].fillna(False)
df["download_status"] = df["download_status"].fillna("No link available")
df["meta_description"] = df["meta_description"].fillna("No link available")

# Save updated data
output_path = data_folder / "input" / "input_entities_with_meta.csv"
df.to_csv(output_path, index=False)
