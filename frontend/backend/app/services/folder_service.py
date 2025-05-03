from datetime import datetime
import uuid
from app.config.supabase import supabase, FOLDERS_TABLE, FILES_TABLE

class FolderService:
    @staticmethod
    def get_folders():
        """Get all folders with their files."""
        # Get all folders
        folders = supabase.table(FOLDERS_TABLE).select('*').execute()
        
        # Get all files
        files = supabase.table(FILES_TABLE).select('*').execute()
        
        # Group files by folder_id
        files_by_folder = {}
        for file in files.data:
            if file['folder_id'] not in files_by_folder:
                files_by_folder[file['folder_id']] = []
            files_by_folder[file['folder_id']].append(file)
        
        # Add files to folders
        for folder in folders.data:
            folder['files'] = files_by_folder.get(folder['id'], [])
        
        return folders.data

    @staticmethod
    def create_folder(name: str):
        """Create a new folder."""
        folder_id = str(uuid.uuid4())
        folder = {
            'id': folder_id,
            'name': name,
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Insert folder into database
        supabase.table(FOLDERS_TABLE).insert(folder).execute()
        
        return folder

    @staticmethod
    def delete_folder(folder_id: str):
        """Delete a folder and all its files."""
        # Get all files in the folder
        files = supabase.table(FILES_TABLE).select('*').eq('folder_id', folder_id).execute()
        
        # Delete files from storage and database
        for file in files.data:
            # Delete from storage
            supabase.storage.from_('resumes').remove([file['storage_path']])
            # Delete from database
            supabase.table(FILES_TABLE).delete().eq('id', file['id']).execute()
        
        # Delete folder from database
        supabase.table(FOLDERS_TABLE).delete().eq('id', folder_id).execute()
        
        return True 