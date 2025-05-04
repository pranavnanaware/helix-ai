from datetime import datetime
import uuid
from typing import Dict, List, Any, Optional
from app.config.supabase import supabase, SEQUENCES_TABLE

class SequenceService:
    @staticmethod
    def create_sequence(
        title: str,
        description: str,
        steps: List[Dict[str, Any]],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new sequence."""
        try:
            sequence_id = str(uuid.uuid4())
            sequence = {
                'id': sequence_id,
                'title': title,
                'description': description,
                'steps': steps,
                'metadata': metadata or {},
                'is_active': True,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            result = supabase.table(SEQUENCES_TABLE).insert(sequence).execute()
            if not result.data:
                raise Exception("Failed to create sequence")
            return result.data[0]
        except Exception as e:
            raise Exception(f"Error creating sequence: {str(e)}")

    @staticmethod
    def update_sequence(
        sequence_id: str,
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update an existing sequence."""
        try:
            # Ensure we don't update the ID
            if 'id' in updates:
                del updates['id']
            
            # Add updated_at timestamp
            updates['updated_at'] = datetime.utcnow().isoformat()
            
            result = supabase.table(SEQUENCES_TABLE)\
                .update(updates)\
                .eq('id', sequence_id)\
                .execute()
                
            if not result.data:
                raise Exception("Failed to update sequence")
            return result.data[0]
        except Exception as e:
            raise Exception(f"Error updating sequence: {str(e)}")

    @staticmethod
    def get_sequence(sequence_id: str) -> Optional[Dict[str, Any]]:
        """Get a sequence by ID."""
        try:
            result = supabase.table(SEQUENCES_TABLE)\
                .select('*')\
                .eq('id', sequence_id)\
                .single()\
                .execute()
                
            return result.data if result.data else None
        except Exception as e:
            raise Exception(f"Error getting sequence: {str(e)}")

    @staticmethod
    def list_sequences(
        limit: int = 10,
        offset: int = 0,
        active_only: bool = True
    ) -> List[Dict[str, Any]]:
        """List sequences with optional filtering."""
        try:
            query = supabase.table(SEQUENCES_TABLE)\
                .select('*')\
                .order('created_at', desc=True)\
                .limit(limit)\
                .offset(offset)
                
            if active_only:
                query = query.eq('is_active', True)
                
            result = query.execute()
            return result.data
        except Exception as e:
            raise Exception(f"Error listing sequences: {str(e)}")

# Create a singleton instance
sequence_service = SequenceService()
