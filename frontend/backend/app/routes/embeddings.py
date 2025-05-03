from flask import Blueprint
from app.controllers.embedding_controller import EmbeddingController

bp = Blueprint('embeddings', __name__, url_prefix='/api')

@bp.route('/embeddings', methods=['POST'])
def create_embedding():
    return EmbeddingController.create_embedding()

@bp.route('/files/<file_id>/embeddings', methods=['GET'])
def get_embeddings(file_id):
    return EmbeddingController.get_embeddings(file_id)

@bp.route('/files/<file_id>/embeddings', methods=['DELETE'])
def delete_embeddings(file_id):
    return EmbeddingController.delete_embeddings(file_id) 