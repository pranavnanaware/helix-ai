from datetime import datetime
import uuid
from typing import List, Dict, Any, Optional
from app.config.supabase import supabase, MESSAGES_TABLE, SESSIONS_TABLE

class MessageService:
    @staticmethod
    def create_session(session_data: dict) -> dict:
        """Create a new session."""
        try:
            # Ensure the session ID is a valid UUID string
            if 'id' not in session_data or not session_data['id']:
                session_data['id'] = str(uuid.uuid4())
            
            result = supabase.table(SESSIONS_TABLE).insert(session_data).execute()
            if not result.data:
                raise Exception("Failed to create session")
            return result.data[0]
        except Exception as e:
            raise Exception(f"Error creating session: {str(e)}")

    @staticmethod
    def create_message(
        session_id: str,
        role: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new message."""
        message_id = str(uuid.uuid4())
        message = {
            'id': message_id,
            'session_id': session_id,
            'role': role,
            'content': content,
            'metadata': metadata or {},
            'created_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table(MESSAGES_TABLE).insert(message).execute()
        return result.data[0]

    @staticmethod
    def get_messages(
        session_id: str,
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get messages for a session."""
        result = supabase.table(MESSAGES_TABLE)\
            .select('*')\
            .eq('session_id', session_id)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .offset(offset)\
            .execute()
            
        return result.data

# Create a singleton instance
message_service = MessageService() 