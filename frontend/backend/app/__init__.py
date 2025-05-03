from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from app.config.supabase import init_supabase
from app.routes.folders import bp as folders_bp
from app.routes.files import bp as files_bp
from app.routes.embeddings import bp as embeddings_bp

def create_app():
    load_dotenv()
    
    app = Flask(__name__)
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "DELETE"],
            "allow_headers": ["Content-Type"]
        }
    })

    # Configure app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev')
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize Supabase
    init_supabase()

    # Register blueprints
    app.register_blueprint(folders_bp)
    app.register_blueprint(files_bp)
    app.register_blueprint(embeddings_bp)

    return app 