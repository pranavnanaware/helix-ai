from flask import jsonify, request
from app.services.folder_service import FolderService

class FolderController:
    @staticmethod
    def get_folders():
        """Get all folders with their files."""
        try:
            folders = FolderService.get_folders()
            return jsonify(folders), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def create_folder():
        """Create a new folder."""
        try:
            data = request.get_json()
            if not data or 'name' not in data:
                return jsonify({'error': 'Name is required'}), 400
            
            folder = FolderService.create_folder(data['name'])
            return jsonify(folder), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def delete_folder(folder_id: str):
        """Delete a folder and all its files."""
        try:
            FolderService.delete_folder(folder_id)
            return '', 204
        except Exception as e:
            return jsonify({'error': str(e)}), 500 