FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app

EXPOSE 8004

CMD ["uvicorn", "service.api:app", "--host", "0.0.0.0", "--port", "8004"]
