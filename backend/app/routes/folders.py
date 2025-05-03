from flask import Blueprint
from app.controllers.folder_controller import FolderController

bp = Blueprint('folders', __name__, url_prefix='/api')

@bp.route('/folders', methods=['GET'])
def get_folders():
    return FolderController.get_folders()

@bp.route('/folders', methods=['POST'])
def create_folder():
    return FolderController.create_folder()

@bp.route('/folders/<folder_id>', methods=['DELETE'])
def delete_folder(folder_id):
    return FolderController.delete_folder(folder_id) 