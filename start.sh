#!/bin/bash
set -e

echo "Starting Habit Tracker server..."
echo "The app will be available at http://127.0.0.1:5000"
echo "Press Ctrl+C to stop the server"
echo ""

python -m flask --app app run --host 0.0.0.0 --port 5000
