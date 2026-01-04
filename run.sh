#!/bin/bash

# Ensure the script exits upon any error
set -e

# Check if uv is available
if command -v uv &> /dev/null; then
    echo "Using uv to manage environment..."
    # uv will handle virtual environment creation and dependency installation automatically
    uv run python aba-to-wise.py "$@"
else
    echo "uv not found. Using traditional virtual environment approach..."
    
    # Create virtual environment if it doesn't exist
    if [ ! -d ".venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv .venv
    fi
    
    # Activate the virtual environment
    if [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
    elif [ -f ".venv/Scripts/activate" ]; then
        source .venv/Scripts/activate
    else
        echo "Cannot find activate script in .venv"
        exit 1
    fi
    
    # Install dependencies if pyproject.toml exists
    if [ -f "pyproject.toml" ]; then
        echo "Installing dependencies..."
        pip install -e . -q
    fi
    
    # Run the Python script with all provided arguments
    python aba-to-wise.py "$@"
fi