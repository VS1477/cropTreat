# Deployment Environment Setup

This project is deployed as three services:

1. Vercel: `client/` React app
2. Render Node service: `server/` Express proxy
3. Render Python service: root `app.py` Flask AI service

## Vercel Client

Root directory:

```text
client
```

Build command:

```text
npm run build
```

Output directory:

```text
dist
```

Environment variable:

```text
VITE_API_BASE=https://your-node-service.onrender.com
```

## Render Node Server

Root directory:

```text
server
```

Build command:

```text
npm install
```

Start command:

```text
npm start
```

Environment variables:

```text
AI_SERVICE_URL=https://your-flask-ai-service.onrender.com
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
```

Render sets `PORT` automatically.

## Render Flask AI Service

Root directory:

```text
.
```

Build command:

```text
pip install -r requirements.txt
```

Start command:

```text
gunicorn app:app
```

Environment variables:

```text
FLASK_DEBUG=false
CORS_ORIGIN=https://your-node-service.onrender.com
```

Render sets `PORT` automatically.

## Local Development

Client:

```text
cd client
npm run dev
```

Node server:

```text
cd server
npm run dev
```

Flask AI service:

```text
python app.py
```

Local `.env` files are included for convenience. The `.env.example` files are the versions you should use as templates for hosting dashboards.
