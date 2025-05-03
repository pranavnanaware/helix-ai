import os
from rq import Queue
from redis import Redis

# Initialize Redis connection
redis_conn = Redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379/0'))

# Initialize RQ queue
task_queue = Queue('default', connection=redis_conn)

def enqueue_task(func, *args, **kwargs):
    """Enqueue a task to be processed in the background."""
    return task_queue.enqueue(func, *args, **kwargs) 