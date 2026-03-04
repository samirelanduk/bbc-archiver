import os

broker_url = os.environ.get("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672//")
result_backend = None
task_serializer = "json"
accept_content = ["json"]
timezone = "UTC"

interval = int(os.environ.get("SNAPSHOT_INTERVAL_SECONDS", 120))

beat_schedule = {
    "take-snapshot": {
        "task": "tasks.take_snapshot",
        "schedule": interval,
    },
}
