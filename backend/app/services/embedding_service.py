from datetime import datetime
import uuid
from app.config.supabase import supabase, EMBEDDINGS_TABLE, FILES_TABLE

class EmbeddingService:
    @staticmethod
    def create_embedding(file_id: str, embedding: list):
        """Create a new embedding record."""
        # Verify file exists
        file = supabase.table(FILES_TABLE).select('*').eq('id', file_id).execute()
        if not file.data:
            raise ValueError('File not found')
        
        # Create embedding record
        embedding_id = str(uuid.uuid4())
        embedding_record = {
            'id': embedding_id,
            'file_id': file_id,
            'embedding': embedding,
            'created_at': datetime.utcnow().isoformat()
        }
        
        supabase.table(EMBEDDINGS_TABLE).insert(embedding_record).execute()
        
        return embedding_record

    @staticmethod
    def delete_embeddings(file_id: str):
        """Delete all embeddings for a file."""
        supabase.table(EMBEDDINGS_TABLE).delete().eq('file_id', file_id).execute()
        return True 