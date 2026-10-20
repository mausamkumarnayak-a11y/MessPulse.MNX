# ============================================================
# Stage 1: Build Frontend (Vite + React Dark Spatial Prototype)
# ============================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ============================================================
# Stage 2: Production Python Backend + Static Asset Serving
# ============================================================
FROM python:3.11-slim AS production

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production \
    PORT=8000

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY backend/ /app/

# Copy compiled frontend distribution from Stage 1 into /app/frontend_dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend_dist

# Expose container port
EXPOSE 8000

# Start server using Uvicorn on dynamic Render PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
