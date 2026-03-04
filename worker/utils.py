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


def extract_text(html):
    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["script", "style", "nav", "footer", "noscript", "svg", "iframe"]):
        tag.decompose()
    text = soup.get_text(separator="\n", strip=True)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines)


def index_snapshot(es, timestamp, filename, thumb_filename, text_content, url):
    ensure_index(es)
    doc_id = timestamp.replace(":", "-").replace(".", "-")
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
    )
