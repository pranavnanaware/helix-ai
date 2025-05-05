from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from app.config.supabase import init_supabase
from app.routes.chat_routes import chat_bp
from app.routes.sequences import bp as sequence_bp
from app.tasks.email_queue_processor import email_queue_processor

def create_app():
    load_dotenv()
    
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    # Configure app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev')
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize Supabase
    init_supabase()

    # Start email queue processor
    email_queue_processor.start()

    # Register blueprints
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(sequence_bp, url_prefix='/api')

    return app 