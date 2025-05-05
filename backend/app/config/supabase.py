from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL and Key must be set in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Database table names
MESSAGES_TABLE = 'messages'
SESSIONS_TABLE = 'sessions'
SEQUENCES_TABLE = 'sequences'

def init_supabase():
    """Initialize Supabase database tables if they don't exist."""
    try:
        # No initialization needed for now
        pass
    except Exception as e:
        print(f"Error initializing Supabase: {str(e)}")
        raise 