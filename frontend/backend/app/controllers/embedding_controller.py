from flask import jsonify, request
from app.services.embedding_service import EmbeddingService

class EmbeddingController:
    @staticmethod
    def create_embedding():
        """Create a new embedding record."""
        try:
            data = request.get_json()
            if not data or 'file_id' not in data or 'embedding' not in data:
                return jsonify({'error': 'File ID and embedding are required'}), 400
            
            embedding = EmbeddingService.create_embedding(data['file_id'], data['embedding'])
            return jsonify(embedding), 201
        except ValueError as e:
            return jsonify({'error': str(e)}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def get_embeddings(file_id: str):
        """Get all embeddings for a file."""
        try:
            embeddings = EmbeddingService.get_embeddings(file_id)
            return jsonify(embeddings), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @staticmethod
    def delete_embeddings(file_id: str):
        """Delete all embeddings for a file."""
        try:
            EmbeddingService.delete_embeddings(file_id)
            return '', 204
        except Exception as e:
            return jsonify({'error': str(e)}), 500 