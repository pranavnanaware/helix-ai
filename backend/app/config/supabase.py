from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and Key must be set in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Storage bucket names
RESUMES_BUCKET = 'resumes'

# Database table names
FOLDERS_TABLE = 'folders'
FILES_TABLE = 'files'
EMBEDDINGS_TABLE = 'vectors'

def init_supabase():
    """Initialize Supabase storage and database tables if they don't exist."""
    try:
        # Create storage bucket if it doesn't exist
        buckets = supabase.storage.list_buckets()
        if RESUMES_BUCKET not in [bucket.name for bucket in buckets]:
            supabase.storage.create_bucket(RESUMES_BUCKET)
            # Make bucket public after creation
            supabase.storage.update_bucket(RESUMES_BUCKET, {'public': True})
        
    except Exception as e:
        print(f"Error initializing Supabase: {str(e)}")
        raise 