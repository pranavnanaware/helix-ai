from datetime import datetime
import os
import uuid
from app.config.supabase import supabase, RESUMES_BUCKET, FILES_TABLE
from app.utils.vectorization import process_file

class FileService:
    @staticmethod
    def get_files(folder_id: str):
        """Get all files in a folder."""
        files = supabase.table(FILES_TABLE).select('*').eq('folder_id', folder_id).execute()
        return files.data

    @staticmethod
    def upload_file(file, folder_id: str):
        """Upload a file and process it for vectorization."""
        # Generate unique file ID and storage path
        file_id = str(uuid.uuid4())
        storage_path = f"{folder_id}/{file_id}_{file.filename}"
        
        # Upload file to Supabase storage
        supabase.storage.from_(RESUMES_BUCKET).upload(storage_path, file.read())
        
        # Get file size
        file_size = len(file.getvalue()) if hasattr(file, 'getvalue') else file.content_length
        
        # Create file record
        file_record = {
            'id': file_id,
            'folder_id': folder_id,
            'filename': file.filename,
            'storage_path': storage_path,
            'size': file_size,
            'status': 'processing',
            'created_at': datetime.utcnow().isoformat()
        }
        
        supabase.table(FILES_TABLE).insert(file_record).execute()
        
        return file_record

    @staticmethod
    def process_file(file_id: str, file_path: str, folder_id: str):
        """Process a file for vectorization."""
        try:
            # Process file for vectorization
            process_file(file_path, file_id, folder_id)
            
            # Update file status to vectorized
            supabase.table(FILES_TABLE).update({
                'status': 'vectorized',
                'vectorized_at': datetime.utcnow().isoformat()
            }).eq('id', file_id).execute()
            
        except Exception as e:
            # Update file status to error
            supabase.table(FILES_TABLE).update({
                'status': 'error',
                'error_message': str(e)
            }).eq('id', file_id).execute()
            raise

    @staticmethod
    def delete_file(file_id: str):
        """Delete a file and its associated data."""
        # Get file record
        file = supabase.table(FILES_TABLE).select('*').eq('id', file_id).execute()
        if not file.data:
            raise ValueError('File not found')
        
        file = file.data[0]
        
        # Delete from storage
        supabase.storage.from_(RESUMES_BUCKET).remove([file['storage_path']])
        
        # Delete from database
        supabase.table(FILES_TABLE).delete().eq('id', file_id).execute()
        
        return True 