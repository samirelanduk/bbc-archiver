import os
from bs4 import BeautifulSoup
from elasticsearch import Elasticsearch

ES_HOST = os.environ.get("ELASTICSEARCH_HOST", "http://elasticsearch:9200")
INDEX_NAME = "snapshots"


def get_es_client():
    return Elasticsearch(ES_HOST)


def ensure_index(es):
    if not es.indices.exists(index=INDEX_NAME):
        es.indices.create(
            index=INDEX_NAME,
            body={
                "mappings": {
                    "properties": {
                        "timestamp": {"type": "date"},
                        "filename": {"type": "keyword"},
                        "thumb_filename": {"type": "keyword"},
                        "url": {"type": "keyword"},
                        "text_content": {"type": "text", "analyzer": "english"},
                    }
                }
            },
        )


import re

# Lines matching any of these patterns are removed from extracted text
NOISE_PATTERNS = [
    re.compile(r"^\d+\s*(hrs?|hours?|mins?|minutes?|secs?|seconds?|days?)\s+ago$", re.IGNORECASE),
    re.compile(r"^posted\b", re.IGNORECASE),
    re.compile(r"^updated\b", re.IGNORECASE),
    re.compile(r"^(just now|live)$", re.IGNORECASE),
    re.compile(r"cookie", re.IGNORECASE),
    re.compile(r"consent", re.IGNORECASE),
    re.compile(r"privacy", re.IGNORECASE),
    re.compile(r"^skip to", re.IGNORECASE),
    re.compile(r"^(share|copy link|close)$", re.IGNORECASE),
    re.compile(r"^(sign in|register|log in|subscribe)$", re.IGNORECASE),
    re.compile(r"^(bbc homepage|home)$", re.IGNORECASE),
]


def is_noise(line):
    if len(line) < 3:
        return True
    return any(p.search(line) for p in NOISE_PATTERNS)


def extract_text(html):
    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["script", "style", "nav", "footer", "noscript", "svg",
                      "iframe", "header", "aside", "form", "button"]):
        tag.decompose()
    # Remove cookie/consent related elements by attribute
    for el in soup.select('[id*="cookie"], [id*="consent"], [class*="cookie"], [class*="consent"]'):
        el.decompose()
    text = soup.get_text(separator="\n", strip=True)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    lines = [line for line in lines if not is_noise(line)]
    return "\n".join(lines)


def index_snapshot(es, timestamp, filename, thumb_filename, text_content, url):
    ensure_index(es)
    doc_id = filename.replace(".png", "")
    es.index(
        index=INDEX_NAME,
        id=doc_id,
        document={
            "timestamp": timestamp,
            "filename": filename,
            "thumb_filename": thumb_filename,
            "url": url,
            "text_content": text_content,
        },
        refresh="wait_for",
    )
