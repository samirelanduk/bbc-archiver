# BBC News Archive

A self-updating archive of the BBC News front page. A Celery worker periodically captures full-page screenshots of [bbc.co.uk/news](https://www.bbc.co.uk/news), indexes the text content in Elasticsearch, and serves everything through a Next.js UI where you can browse and search snapshots.

Live at **[bbc.frontpagearchive.com](https://bbc.frontpagearchive.com)**

## Architecture

```
Celery Beat ─► RabbitMQ ─► Worker ─► Playwright screenshot
                                        │
                                   /snapshots/ (shared volume)
                                        │
                                   Elasticsearch (metadata + text)
                                        │
                              Next.js ◄─┘ (queries)
                                 │
                              Nginx (reverse proxy)
```

| Service         | Role                                        |
| --------------- | ------------------------------------------- |
| **Next.js**     | Frontend UI and API routes                  |
| **Nginx**       | Reverse proxy, serves static snapshot files |
| **Worker**      | Celery worker — takes screenshots, indexes  |
| **Beat**        | Celery Beat — triggers snapshots on a cron  |
| **RabbitMQ**    | Message broker                              |
| **Elasticsearch** | Search index and metadata store           |

## Tech Stack

- **Frontend** — Next.js 14, React 18, Tailwind CSS
- **Worker** — Python 3, Celery, Playwright, BeautifulSoup, Pillow
- **Infrastructure** — Docker Compose, Nginx, RabbitMQ, Elasticsearch 8

## Local Development

```bash
./local.sh <PORT> [--restart]
```

This spins up all services via Docker Compose with dev overrides (local volumes, mapped ports). Snapshots are written to `./snapshots/`. Pass `--restart` to tear down volumes before starting fresh.

```bash
# Example: run on port 8080
./local.sh 8080
```

## Deployment

```bash
./deploy.sh <SSH_HOST> [--proxy=CONTAINER_NAME]
```

Builds and pushes images to Docker Hub, SSHs into the host, and runs the stack. The site is served behind an nginx-proxy with automatic Let's Encrypt TLS.

## Configuration

Key environment variables (set in `docker-compose.yml` or `.env`):

| Variable                     | Default                                | Description                  |
| ---------------------------- | -------------------------------------- | ---------------------------- |
| `SNAPSHOT_INTERVAL_MINUTES`  | `2`                                    | Minutes between snapshots    |
| `ELASTICSEARCH_HOST`         | `http://elasticsearch:9200`            | Elasticsearch URL            |
| `RABBITMQ_URL`               | `amqp://guest:guest@rabbitmq:5672//`   | RabbitMQ connection string   |
| `TAG`                        | —                                      | Docker image tag             |
| `HOSTNAME`                   | —                                      | Domain for nginx-proxy / TLS |

## How Snapshots Work

1. Playwright loads the BBC News front page (1280×800 viewport)
2. Cookie consent banners and sign-in prompts are dismissed via DOM manipulation
3. The page is scrolled to trigger lazy-loaded content
4. A full-page screenshot is saved as `YYYY-MM-DDTHH-MM.png`
5. A 400px-wide thumbnail is generated with Pillow
6. BeautifulSoup extracts the text content (stripping nav, scripts, footers, etc.)
7. The snapshot metadata and text are indexed in Elasticsearch

Failed captures retry up to 3 times with a 30-second delay.

---

This project is independent and not affiliated with the BBC.
