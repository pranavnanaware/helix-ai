from typing import Optional
from datetime import datetime
import uuid
from ..models.session import Session
from ..models.chat import Message

class SessionService:
    def __init__(self, db):
        self.db = db

    async def create_session(self) -> Session:
        """Create a new session."""
        session_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        session = Session(
            id=session_id,
            messages=[],
            current_sequence=None,
            campaign_context={},
            created_at=now,
            updated_at=now,
            is_active=True
        )
        
        await self.db.sessions.insert_one(session.dict())
        return session

    async def get_session(self, session_id: str) -> Optional[Session]:
        """Get a session by ID."""
        session_data = await self.db.sessions.find_one({"id": session_id, "is_active": True})
        if session_data:
            return Session(**session_data)
        return None

    async def update_session(self, session_id: str, updates: dict) -> Optional[Session]:
        """Update a session."""
        updates["updated_at"] = datetime.utcnow().isoformat()
        
        result = await self.db.sessions.update_one(
            {"id": session_id},
            {"$set": updates}
        )
        
        if result.modified_count > 0:
            return await self.get_session(session_id)
        return None

    async def add_message(self, session_id: str, message: Message) -> Optional[Session]:
        """Add a message to the session."""
        session = await self.get_session(session_id)
        if not session:
            return None
            
        session.messages.append(message)
        return await self.update_session(session_id, {"messages": session.messages})

    async def set_current_sequence(self, session_id: str, sequence) -> Optional[Session]:
        """Set the current sequence for a session."""
        return await self.update_session(session_id, {"current_sequence": sequence})

    async def update_campaign_context(self, session_id: str, context: dict) -> Optional[Session]:
        """Update the campaign context for a session."""
        session = await self.get_session(session_id)
        if not session:
            return None
            
        current_context = session.campaign_context or {}
        current_context.update(context)
        return await self.update_session(session_id, {"campaign_context": current_context})

    async def end_session(self, session_id: str) -> bool:
        """End a session by marking it as inactive."""
        result = await self.db.sessions.update_one(
            {"id": session_id},
            {"$set": {"is_active": False}}
        )
        return result.modified_count > 0 