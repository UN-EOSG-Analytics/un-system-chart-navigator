#!/bin/bash

# Update UN System Chart Navigator Data
# This script fetches data from Airtable and processes it for the web application

set -e  # Exit on any error

echo "🚀 Starting data update process..."
echo ""

echo "📡 Step 1: Fetching data from Airtable..."
uv run python/01-fetch_from_airtable.py

echo ""
echo "⚙️ Step 2: Processing entities data..."
uv run python/02-process_entities_data.py

echo ""
echo "✅ Data update complete!"
echo "📄 Updated files:"
echo "  - data/input/input_entities.csv"
echo "  - public/entities.json"