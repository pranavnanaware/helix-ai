from flask import Blueprint, request, jsonify
from app.services.sequence_service import sequence_service
from app.services.gpt_service import gpt_service

bp = Blueprint('sequences', __name__)

@bp.route('/sequences', methods=['POST'])
def create_sequence():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        # Validate required fields
        if 'title' not in data:
            return jsonify({"error": "Title is required"}), 400
        if 'description' not in data:
            return jsonify({"error": "Description is required"}), 400
        if 'steps' not in data:
            return jsonify({"error": "Steps are required"}), 400
            
        # Validate steps array
        if not isinstance(data['steps'], list):
            return jsonify({"error": "Steps must be an array"}), 400
            
        for step in data['steps']:
            if not isinstance(step, dict):
                return jsonify({"error": "Each step must be an object"}), 400
            required_fields = ['content', 'delay_days', 'step_number', 'type', 'step_title']
            for field in required_fields:
                if field not in step:
                    return jsonify({"error": f"Step is missing required field: {field}"}), 400
            
        sequence = sequence_service.create_sequence(
            title=data['title'],
            description=data['description'],
            steps=data['steps'],
            metadata=data.get('metadata')
        )
        
        return jsonify(sequence), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/sequences/<sequence_id>', methods=['PUT'])
def update_sequence(sequence_id: str):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        # Validate sequence exists
        existing_sequence = sequence_service.get_sequence(sequence_id)
        if not existing_sequence:
            return jsonify({"error": "Sequence not found"}), 404
            
        # Validate steps if provided
        if 'steps' in data:
            if not isinstance(data['steps'], list):
                return jsonify({"error": "Steps must be an array"}), 400
                
            for step in data['steps']:
                if not isinstance(step, dict):
                    return jsonify({"error": "Each step must be an object"}), 400
                required_fields = ['content', 'delay_days', 'step_number', 'type', 'step_title']
                for field in required_fields:
                    if field not in step:
                        return jsonify({"error": f"Step is missing required field: {field}"}), 400
            
        sequence = sequence_service.update_sequence(sequence_id, data)
        return jsonify(sequence)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/sequences/<sequence_id>', methods=['GET'])
def get_sequence(sequence_id: str):
    try:
        sequence = sequence_service.get_sequence(sequence_id)
        if not sequence:
            return jsonify({"error": "Sequence not found"}), 404
            
        return jsonify(sequence)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/sequences/<sequence_id>', methods=['DELETE'])
def delete_sequence(sequence_id: str):
    try:
        # Validate sequence exists
        existing_sequence = sequence_service.get_sequence(sequence_id)
        if not existing_sequence:
            return jsonify({"error": "Sequence not found"}), 404
            
        # Soft delete by setting is_active to false
        sequence = sequence_service.delete_sequence(sequence_id)
        return jsonify({"message": "Sequence deleted successfully"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/sequences', methods=['GET'])
def list_sequences():
    try:
        limit = request.args.get('limit', default=10, type=int)
        offset = request.args.get('offset', default=0, type=int)
        active_only = request.args.get('active_only', default='true').lower() == 'true'
        
        sequences = sequence_service.list_sequences(
            limit=limit,
            offset=offset,
            active_only=active_only
        )
        
        return jsonify({"sequences": sequences})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/sequences/generate', methods=['POST'])
def generate_sequence():
    try:
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({"error": "Prompt is required"}), 400
            
        result = gpt_service.generate_sequence(data['prompt'])
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/sequences/<sequence_id>/edit', methods=['POST'])
def edit_sequence_with_gpt(sequence_id: str):
    try:
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({"error": "Prompt is required"}), 400
            
        # Validate sequence exists
        existing_sequence = sequence_service.get_sequence(sequence_id)
        if not existing_sequence:
            return jsonify({"error": "Sequence not found"}), 404
            
        result = gpt_service.edit_sequence(sequence_id, data['prompt'])
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500 