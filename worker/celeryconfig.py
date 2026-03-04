import os

from celery.schedules import crontab

broker_url = os.environ.get("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672//")
result_backend = None
task_serializer = "json"
accept_content = ["json"]
timezone = "Europe/London"

interval_minutes = int(os.environ.get("SNAPSHOT_INTERVAL_MINUTES", 2))

if interval_minutes < 60:
    schedule = crontab(minute=f"*/{interval_minutes}")
else:
    hours = interval_minutes // 60
    schedule = crontab(minute="0", hour=f"*/{hours}")

beat_schedule = {
    "take-snapshot": {
        "task": "tasks.take_snapshot",
        "schedule": schedule,
    },
}
