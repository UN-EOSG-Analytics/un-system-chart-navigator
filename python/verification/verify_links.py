import json
import time
from http import HTTPStatus
from pathlib import Path
from typing import Dict

import pandas as pd
import requests
from playwright.sync_api import sync_playwright
from requests.adapters import HTTPAdapter
from tqdm import tqdm
from urllib3.util.retry import Retry


def create_session() -> requests.Session:
    """
    Create a requests session with retry logic and human-like headers.
    This prevents the requests from being blocked as automated traffic.
    """
    session = requests.Session()

    # Configure retry strategy for transient failures
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET"],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    # Human-like headers to avoid being blocked
    session.headers.update(
        {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }
    )

    return session


def check_content_quality(response: requests.Response) -> dict:
    """
    Check if the page content makes sense and is not a 404/error page.

    Returns:
        Dictionary with content analysis results
    """
    content = response.text.lower()
    content_length = len(content)

    # Common error page indicators
    error_indicators = [
        "page not found",
        "404 error",
        "page cannot be found",
        "page does not exist",
        "this page isn't available",
        "the page you requested could not be found",
        "no such page",
        "error 404",
        "not found",
        "access denied",
        "forbidden",
        "403 error",
        "500 error",
        "internal server error",
        "service unavailable",
        "temporarily unavailable",
    ]

    # Check if any error indicators are present
    has_error_indicator = any(indicator in content for indicator in error_indicators)

    return {
        "content_length": content_length,
        "has_error_indicator": has_error_indicator,
        "content_valid": content_length >= 200 and not has_error_indicator,
    }


def get_status_name(status_code: int) -> str:
    """Get human-readable name for HTTP status code."""
    try:
        return HTTPStatus(status_code).phrase
    except ValueError:
        return "Unknown"


def take_screenshot(url: str, entity_name: str, screenshot_dir: Path) -> Dict:
    """
    Take a screenshot of the webpage using Playwright.

    Args:
        url: URL to screenshot
        entity_name: Name of the entity (used for filename)
        screenshot_dir: Directory to save screenshots

    Returns:
        Dictionary with screenshot results
    """
    result = {
        "screenshot_taken": False,
        "screenshot_path": None,
        "screenshot_error": None,
    }

    # Skip invalid URLs
    if not url or url in [
        "Not found",
        "Not found.",
        "Not applicable",
        "No link found",
        "null",
        "None",
    ]:
        result["screenshot_error"] = "Invalid URL"
        return result

    try:
        with sync_playwright() as p:
            # Launch browser with headless mode
            browser = p.chromium.launch(headless=True)

            # Create context with realistic viewport and user agent
            context = browser.new_context(
                viewport={"width": 1920, "height": 1080},
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            )

            page = context.new_page()

            # Navigate to the page with timeout
            page.goto(url, wait_until="networkidle", timeout=30000)

            # Wait a bit for any dynamic content to load
            page.wait_for_timeout(2000)

            # Create screenshot filename from entity name
            safe_filename = "".join(
                c if c.isalnum() or c in ("-", "_") else "_" for c in entity_name
            )
            screenshot_path = screenshot_dir / f"{safe_filename}.png"

            # Take full page screenshot with high quality
            page.screenshot(path=str(screenshot_path), full_page=True, type="png")

            result["screenshot_taken"] = True
            result["screenshot_path"] = str(screenshot_path)

            browser.close()

    except TimeoutError:
        result["screenshot_error"] = "Page load timeout"
    except Exception as e:
        result["screenshot_error"] = f"Screenshot error: {str(e)[:100]}"

    return result


def verify_link(session: requests.Session, url: str, delay: float = 0.5) -> Dict:
    """
    Verify a single URL for accessibility and content quality.

    Args:
        session: Requests session with retry logic
        url: URL to verify
        delay: Delay in seconds between requests (to be respectful)

    Returns:
        Dictionary with verification results
    """
    result = {
        "url": url,
        "accessible": False,
        "status_code": None,
        "status_name": None,
        "content_valid": False,
        "content_length": None,
        "has_error_indicator": None,
        "error": None,
        "redirect_url": None,
    }

    # Skip obviously invalid URLs
    if not url or url in [
        "Not found",
        "Not found.",
        "Not applicable",
        "No link found",
        "null",
        "None",
    ]:
        result["error"] = "Invalid or placeholder URL"
        return result

    try:
        # Add delay to be respectful to servers
        time.sleep(delay)

        # Make request with timeout
        response = session.get(url, timeout=10, allow_redirects=True)

        result["status_code"] = response.status_code
        result["status_name"] = get_status_name(response.status_code)
        result["accessible"] = response.status_code == 200

        # Check if we were redirected
        if response.url != url:
            result["redirect_url"] = response.url

        # If accessible, check content quality
        if result["accessible"]:
            content_info = check_content_quality(response)
            result["content_valid"] = content_info["content_valid"]
            result["content_length"] = content_info["content_length"]
            result["has_error_indicator"] = content_info["has_error_indicator"]
        else:
            result["content_length"] = 0

    except requests.exceptions.Timeout:
        result["error"] = "Request timeout (>10s)"
    except requests.exceptions.TooManyRedirects:
        result["error"] = "Too many redirects"
    except requests.exceptions.ConnectionError as e:
        result["error"] = f"Connection error: {str(e)[:100]}"
    except requests.exceptions.RequestException as e:
        result["error"] = f"Request error: {str(e)[:100]}"
    except Exception as e:
        result["error"] = f"Unexpected error: {str(e)[:100]}"

    return result


def verify_entity_links(
    df: pd.DataFrame, link_column: str = "entity_link", take_screenshots: bool = True
) -> pd.DataFrame:
    """
    Verify all entity links in the dataframe.

    Args:
        df: DataFrame with entity data
        link_column: Name of column containing links to verify
        take_screenshots: Whether to take screenshots of the pages

    Returns:
        DataFrame with verification results
    """
    session = create_session()
    results = []

    # Create screenshot directory if needed
    screenshot_dir = None
    if take_screenshots:
        screenshot_dir = Path("data") / "downloads" / "entity_page_screenshots"
        screenshot_dir.mkdir(parents=True, exist_ok=True)
        print(f"Screenshots will be saved to: {screenshot_dir}")

    # Use tqdm for progress bar
    for idx, row in tqdm(df.iterrows(), total=len(df), desc="Verifying links"):
        entity = row.get("entity", "Unknown")
        url = row.get(link_column)

        result = verify_link(session, str(url) if url else "")
        result["entity"] = entity
        result["column"] = link_column

        # Take screenshot if enabled and URL is accessible
        if take_screenshots and screenshot_dir:
            screenshot_result = take_screenshot(
                str(url) if url else "", entity, screenshot_dir
            )
            result.update(screenshot_result)

        results.append(result)

    return pd.DataFrame(results)


if __name__ == "__main__":
    input_path = Path("public") / "entities.json"
    with open(input_path, "r", encoding="utf-8") as f:
        entities_json = json.load(f)

    df = pd.DataFrame(entities_json)

    # Verify primary entity links
    results = verify_entity_links(df, "entity_link", take_screenshots=True)

    # Reorder columns to put entity and url first
    column_order = [
        "entity",
        "url",
        "accessible",
        "content_valid",
        "content_length",
        "has_error_indicator",
        "status_code",
        "status_name",
        "error",
        "redirect_url",
        "screenshot_taken",
        "screenshot_path",
        "screenshot_error",
        "column",
    ]
    # Only include columns that exist
    column_order = [col for col in column_order if col in results.columns]
    results = results[column_order]

    # Save results
    output_path = Path("data") / "output" / "entity_link_verification_results.csv"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    results.to_csv(output_path, index=False)
    print(f"\nDetailed results saved to: {output_path}\n")

    output_path = Path("public") / "entity_link_verification_results.json"
    results.to_json(output_path, orient="records", indent=2)
