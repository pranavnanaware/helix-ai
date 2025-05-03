from flask import Blueprint, Response, stream_with_context
from app.controllers.file_controller import FileController
from app.config.supabase import supabase, FILES_TABLE
import json
import time

bp = Blueprint('files', __name__, url_prefix='/api')

@bp.route('/folders/<folder_id>/files', methods=['GET'])
def get_files(folder_id):
    return FileController.get_files(folder_id)

@bp.route('/files', methods=['POST'])
def upload_file():
    return FileController.upload_file()

@bp.route('/files/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    return FileController.delete_file(file_id)

@bp.route('/files/<file_id>/status', methods=['GET'])
def stream_file_status(file_id):
    def generate():
        while True:
            # Get current file status
            response = supabase.table(FILES_TABLE).select('status, error_message').eq('id', file_id).execute()
            if response.data:
                file_data = response.data[0]
                yield f"data: {json.dumps(file_data)}\n\n"
                
                # If file is vectorized or has error, stop streaming
                if file_data['status'] in ['vectorized', 'error']:
                    break
            
            time.sleep(1)  # Check every second
    
    return Response(stream_with_context(generate()), mimetype='text/event-stream') 