FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 APP_MODE=demo
COPY requirements.txt ./
COPY app/requirements.txt app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY app/__init__.py app/__init__.py
COPY app/backend app/backend
RUN useradd --create-home appuser && chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--threads", "2", "--timeout", "150", "app.backend.app:app"]
