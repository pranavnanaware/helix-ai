from flask import Blueprint, request, jsonify
from app.services.gpt_service import gpt_service
from app.services.message_service import message_service
import uuid
from datetime import datetime

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/session', methods=['POST'])
def create_session():
    try:
        data = request.get_json() or {}
        title = data.get('title', 'New Chat Session')
        
        session = {
            'title': title,
            'is_active': True,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Create session in database
        result = message_service.create_session(session)
        
        return jsonify({
            "session_id": result['id'],
            "title": result['title']
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/<session_id>', methods=['POST'])
def chat(session_id: str):
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'message' not in data:
            return jsonify({"error": "Message is required"}), 400
            
        message = data['message']
        sequence_id = data.get('sequenceId')  # Extract sequence_id from request body
        
        # Get response from GPT service
        response = gpt_service.chat_completion(
            session_id=session_id,
            message=message,
            sequence_id=sequence_id
        )
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/<session_id>/messages', methods=['GET'])
def get_messages(session_id: str):
    try:
        limit = request.args.get('limit', default=10, type=int)
        offset = request.args.get('offset', default=0, type=int)
        
        messages = message_service.get_messages(
            session_id=session_id,
            limit=limit,
            offset=offset
        )
        
        return jsonify({"messages": messages})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/<session_id>/context', methods=['GET'])
def get_context(session_id: str):
    try:
        context = message_service.get_session_context(session_id)
        return jsonify({"context": context})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/<session_id>/context', methods=['PUT'])
def update_context(session_id: str):
    try:
        data = request.get_json()
        if not data or 'context' not in data:
            return jsonify({"error": "Context is required"}), 400
            
        context = data['context']
        result = message_service.update_session_context(session_id, context)
        return jsonify({"context": result})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/format', methods=['POST'])
def format_messages():
    try:
        data = request.get_json()
        if not data or 'messages' not in data:
            return jsonify({"error": "Messages are required"}), 400
            
        messages = data['messages']
        formatted_messages = gpt_service.format_messages(messages)
        return jsonify({"messages": formatted_messages})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500 