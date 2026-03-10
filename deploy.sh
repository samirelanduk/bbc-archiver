#!/bin/bash

set -e

DOMAIN="bbc.frontpagearchive.com"
PROJECT="bbc-news-archive"
PROXY_CONTAINER="proxy"

export TAG=prod
export HOSTNAME=$DOMAIN
export SNAPSHOT_INTERVAL_MINUTES=120
export DOCKER_DEFAULT_PLATFORM=linux/amd64

# Parse optional arguments
while (( "$#" )); do
  case "$1" in
    --proxy=*)
      PROXY_CONTAINER="${1#*=}"
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: ./deploy.sh [--proxy=CONTAINER_NAME]"
      exit 1
      ;;
  esac
done

docker compose --progress=plain -p $PROJECT build && \
    docker compose -p $PROJECT push && \
    ssh $DOMAIN "mkdir -p ~/$DOMAIN" && \
    scp docker-compose.yml $DOMAIN:~/$DOMAIN/docker-compose.yml && \
    ssh $DOMAIN "cd ~/$DOMAIN && TAG=$TAG HOSTNAME=$HOSTNAME SNAPSHOT_INTERVAL_MINUTES=$SNAPSHOT_INTERVAL_MINUTES docker compose -p $PROJECT pull" && \
    ssh $DOMAIN "cd ~/$DOMAIN && TAG=$TAG HOSTNAME=$HOSTNAME SNAPSHOT_INTERVAL_MINUTES=$SNAPSHOT_INTERVAL_MINUTES docker compose -p $PROJECT up -d" && \
    ssh $DOMAIN "docker network connect bridge ${PROJECT}-nginx-1 2>/dev/null || true" && \
    ssh $DOMAIN "docker restart $PROXY_CONTAINER"

echo "Deployed to $DOMAIN"
