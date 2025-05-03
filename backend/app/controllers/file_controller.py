from flask import jsonify, request, current_app
import os
from app.services.file_service import FileService
from app.services.task_queue import enqueue_task
from worker import process_file_task

class FileController:
    @staticmethod
    def get_files(folder_id: str):
        """Get all files in a folder."""
        try:
            files = FileService.get_files(folder_id)
            return jsonify(files), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def upload_file():
        """Upload a file and process it for vectorization."""
        try:
            if 'file' not in request.files:
                return jsonify({'error': 'No file provided'}), 400
            
            file = request.files['file']
            folder_id = request.form.get('folder_id')
            
            if not folder_id:
                return jsonify({'error': 'Folder ID is required'}), 400
            
            # Upload file and get file record
            file_record = FileService.upload_file(file, folder_id)
            
            # Save file temporarily
            temp_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'temp')
            os.makedirs(temp_dir, exist_ok=True)
            temp_path = os.path.join(temp_dir, f"{file_record['id']}_{file.filename}")
            file.seek(0)  # Reset file pointer
            file.save(temp_path)
            
            # Enqueue file processing task
            enqueue_task(
                process_file_task,
                file_record['id'],
                temp_path,
                folder_id
            )
            
            return jsonify(file_record), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def delete_file(file_id: str):
        """Delete a file and its associated data."""
        try:
            FileService.delete_file(file_id)
            return '', 204
        except ValueError as e:
            return jsonify({'error': str(e)}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500 