#!/bin/bash

set -e

if [ "$#" -lt 1 ]; then
    echo "Usage: ./local.sh PORT_NUMBER [--restart]"
    exit 1
fi

export TAG=local
export PORT=$1
export HOSTNAME=localhost
RESTART=false

shift

while (( "$#" )); do
  case "$1" in
    --restart)
      RESTART=true
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: ./local.sh PORT_NUMBER [--restart]"
      exit 1
      ;;
  esac
done

if [ "$RESTART" = true ]; then
    docker compose -f docker-compose.yml -f docker-compose.dev.yml -p bbc-news-archive down -v
fi

docker compose --progress=plain -f docker-compose.yml -f docker-compose.dev.yml -p bbc-news-archive build && \
    if [ "$RESTART" = false ]; then
        docker compose -f docker-compose.yml -f docker-compose.dev.yml -p bbc-news-archive down
    fi && \
    docker compose -f docker-compose.yml -f docker-compose.dev.yml -p bbc-news-archive up -d
