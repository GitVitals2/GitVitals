#!/bin/bash
# Start ML Prediction Service
# Usage: ./start-ml-service.sh

cd "$(dirname "$0")"

echo "🚀 Starting ML Prediction Service..."

# Activate virtual environment
source ml/.venv/bin/activate

# Set Python path
export PYTHONPATH=/Users/jordanmontenegro/Desktop/GitVitals

# Start service
python3 -m uvicorn ml.service.api:app --host 0.0.0.0 --port 8004 --reload

echo "✅ ML Service is running on http://localhost:8004"
echo "📊 Test it: curl http://localhost:8004/health"
