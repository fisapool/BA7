#!/bin/bash
# Combined setup script for both projects

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install pricing engine dependencies
echo "Installing pricing engine dependencies..."
cd pricing_engine
pip install -r requirements.txt
cd ..

# Create necessary directories
echo "Creating required directories..."
mkdir -p data/raw data/processed data/output
mkdir -p pricing_engine/models

# Copy configuration files
echo "Setting up configuration files..."
cp .env.example .env
echo "Please update the .env file with your configuration"

echo "Setup complete. Run 'docker-compose up' to start the application." 