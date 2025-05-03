import os
import sys
from rq import Worker, Queue, Connection
from redis import Redis
from dotenv import load_dotenv
from app.services.file_service import FileService

# Load environment variables
load_dotenv()

# Disable MPS and set environment variables before importing any ML libraries
os.environ['PYTORCH_ENABLE_MPS_FALLBACK'] = '1'
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'

def process_file_task(file_id: str, file_path: str, folder_id: str):
    """Task to process a file for vectorization."""
    try:
        FileService.process_file(file_id, file_path, folder_id)
    finally:
        # Clean up temp file
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == '__main__':
    # Initialize Redis connection
    redis_conn = Redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379/0'))
    
    # Start worker
    with Connection(redis_conn):
        worker = Worker([Queue('default')])
        worker.work() 