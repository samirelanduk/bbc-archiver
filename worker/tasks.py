import os
from datetime import datetime, timezone

import requests
from celery import Celery
from PIL import Image
from playwright.sync_api import sync_playwright

from utils import get_es_client, extract_text, index_snapshot

app = Celery("tasks")
app.config_from_object("celeryconfig")

SNAPSHOTS_DIR = "/snapshots"
BBC_URL = "https://www.bbc.co.uk/news"
THUMB_WIDTH = 400
NEXT_URL = os.environ.get("NEXT_URL", "http://next:3000")
REVALIDATION_SECRET = os.environ.get("REVALIDATION_SECRET", "")


@app.task(bind=True, max_retries=3, default_retry_delay=30)
def take_snapshot(self):
    os.makedirs(SNAPSHOTS_DIR, exist_ok=True)
    now = datetime.now(timezone.utc)
    ts = now.strftime("%Y-%m-%dT%H-%M")
    filename = f"{ts}.png"
    thumb_filename = f"{ts}_thumb.png"
    filepath = os.path.join(SNAPSHOTS_DIR, filename)
    thumb_filepath = os.path.join(SNAPSHOTS_DIR, thumb_filename)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 1280, "height": 800})
            context.add_cookies([
                {"name": "ckns_policy", "value": "111", "domain": ".bbc.co.uk", "path": "/"},
                {"name": "ckns_explicit", "value": "1", "domain": ".bbc.co.uk", "path": "/"},
                {"name": "ckns_privacy", "value": "1", "domain": ".bbc.co.uk", "path": "/"},
            ])
            page = context.new_page()
            page.goto(BBC_URL, wait_until="networkidle", timeout=60000)

            # Scroll down the page to trigger lazy-loaded images
            page.evaluate("""
                async () => {
                    const delay = ms => new Promise(r => setTimeout(r, ms));
                    const height = document.body.scrollHeight;
                    const step = window.innerHeight;
                    for (let y = 0; y < height; y += step) {
                        window.scrollTo(0, y);
                        await delay(300);
                    }
                    window.scrollTo(0, 0);
                }
            """)
            page.wait_for_timeout(2000)

            # Move mouse away so no link appears hovered
            page.mouse.move(0, 0)

            page.screenshot(path=filepath, full_page=True)
            html = page.content()
            browser.close()

        # Generate thumbnail
        img = Image.open(filepath)
        ratio = THUMB_WIDTH / img.width
        thumb_height = int(img.height * ratio)
        thumb = img.resize((THUMB_WIDTH, thumb_height), Image.LANCZOS)
        thumb.save(thumb_filepath, optimize=True)

        # Extract text and index
        text_content = extract_text(html)
        es = get_es_client()
        iso_ts = now.strftime("%Y-%m-%dT%H:%M:00Z")
        index_snapshot(es, iso_ts, filename, thumb_filename, text_content, BBC_URL)

        # Trigger Next.js to regenerate static pages
        try:
            requests.post(f"{NEXT_URL}/api/revalidate", json={"snapshotId": ts}, headers={"X-Revalidation-Secret": REVALIDATION_SECRET}, timeout=10)
        except Exception as e:
            print(f"Revalidation request failed: {e}")

        print(f"Snapshot saved: {filename}")
        return {"filename": filename, "timestamp": iso_ts}

    except Exception as exc:
        print(f"Snapshot failed: {exc}")
        raise self.retry(exc=exc)
