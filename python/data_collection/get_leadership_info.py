from pathlib import Path

import requests

data_folder = Path("data")

download_folder = data_folder / "downloads" / "leadership"

# URL = "https://www.un.org/sg/en/global-leadership/home"
URL = "https://www.un.org/sg/en/global-leadership/special-political-missions/all"


def download_html(url, save_path):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()  # Raise an error for bad responses (4xx or 5xx)
    save_path.parent.mkdir(parents=True, exist_ok=True)
    with open(save_path, "w", encoding="utf-8") as file:
        file.write(response.text)


download_html(URL, download_folder / "global-leadership_special-political-missions.html")
