# SellScale Backend

This is the backend service for the SellScale application, built with Flask.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file:
```bash
cp .env.example .env
```
Then edit the `.env` file with your actual credentials.

4. Initialize the database:
```bash
flask db init
flask db migrate
flask db upgrade
```

5. Run the development server:
```bash
flask run
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### LinkedIn Integration
- `GET /api/linkedin/auth` - Get LinkedIn authorization URL
- `GET /api/linkedin/callback` - Handle LinkedIn OAuth callback
- `POST /api/linkedin/send-message` - Send a message via LinkedIn

### Health Check
- `GET /api/health` - Check if the service is running

## Development

- Run tests: `pytest`
- Format code: `black .`
- Lint code: `flake8`

## Deployment

The application can be deployed to any WSGI-compatible server. For production:
1. Set appropriate environment variables
2. Use a production-grade WSGI server (e.g., Gunicorn)
3. Set up a proper database (e.g., PostgreSQL)
4. Configure SSL/TLS
5. Set up proper logging and monitoring 