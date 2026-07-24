from fastapi import FastAPI, HTTPException
import requests
import time
from fastapi.middleware.cors import CORSMiddleware
from bs4 import BeautifulSoup

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Page Pulse API Running"
    }


@app.get("/analyze")
def analyze(url: str):

    try:
        # Start Time
        start_time = time.time()

        # Website Request
        response = requests.get(url, timeout=10)

        # End Time
        end_time = time.time()

        # Response Time in Milliseconds
        response_time = round((end_time - start_time) * 1000, 2)

    except requests.exceptions.RequestException:
        raise HTTPException(
            status_code=400,
            detail="Invalid URL or Website is not reachable"
        )

    # HTML Parse
    soup = BeautifulSoup(response.text, "lxml")

    # Title
    title = soup.title.string.strip() if soup.title else "No Title Found"

    # Meta Description
    meta = soup.find("meta", attrs={"name": "description"})
    if meta:
        description = meta.get("content")
    else:
        description = "No Meta Description Found"

    # H1 Count
    h1_tags = soup.find_all("h1")
    h1_count = len(h1_tags)

    # Images Without ALT
    images = soup.find_all("img")

    missing_alt = 0

    for img in images:
        if not img.get("alt"):
            missing_alt += 1

    # Word Count
    text = soup.get_text()
    words = text.split()
    word_count = len(words)

    # Final Response
    return {
        "status_code": response.status_code,
        "response_time_ms": response_time,
        "title": title,
        "meta_description": description,
        "h1_count": h1_count,
        "images_without_alt": missing_alt,
        "word_count": word_count
    }