import os
import tempfile
from typing import Dict, Any
from supabase import Client, create_client
import PyPDF2
import numpy as np
from sentence_transformers import SentenceTransformer
import torch
import gc

# Disable MPS and set environment variables
os.environ['PYTORCH_ENABLE_MPS_FALLBACK'] = '1'
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'
torch.set_num_threads(1)  # Limit CPU threads

# Initialize model globally to avoid multiple loads
model = None

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file."""
    text = ""
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    return text

def get_model():
    """Get the sentence transformer model, loading it if necessary."""
    global model
    if model is None:
        model = SentenceTransformer('all-MiniLM-L6-v2')
    return model

def process_file(file_path: str, file_id: str, folder_id: str) -> None:
    """Process a file for vectorization."""
    try:
        # Extract text from PDF
        text = extract_text_from_pdf(file_path)
        
        # Get model and generate embeddings
        model = get_model()
        embeddings = model.encode(text)
        
        # Store embeddings in Supabase
        supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
        response = supabase.table('embeddings').insert({
            'file_id': file_id,
            'folder_id': folder_id,
            'embedding': embeddings.tolist()
        }).execute()
        
        if not response.data:
            raise Exception("Failed to store embeddings")
            
    finally:
        # Clean up resources
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        gc.collect() 