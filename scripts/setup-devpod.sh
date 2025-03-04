#!/bin/bash

# Setup script for DevPod
# This script helps first-time users set up DevPod for the Muxy project

# Check if DevPod is installed
if ! command -v devpod &> /dev/null; then
    echo "DevPod is not installed. Please install it from https://devpod.sh/"
    echo "Installation instructions:"
    echo "  macOS:   brew install devpod/tap/devpod"
    echo "  Linux:   curl -fsSL https://devpod.sh/install.sh | bash"
    echo "  Windows: choco install devpod"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker Desktop or Docker Engine."
    echo "Visit https://www.docker.com/products/docker-desktop for more information."
    exit 1
fi

echo "Setting up DevPod for Muxy..."

# Create .env file if it doesn't exist
if [ ! -f .devpod/.env ]; then
    echo "Creating .env file from template..."
    cp .devpod/.env.example .devpod/.env
fi

# Start DevPod
echo "Starting DevPod..."
devpod up

echo "DevPod setup complete!"
echo "You can now use the following commands:"
echo "  devpod task install       - Install dependencies"
echo "  devpod task build         - Build the project"
echo "  devpod task test-ffmpeg   - Test if ffmpeg is correctly installed"
echo "  devpod task container-test - Create a test video file for examples"
echo "  devpod task run-example   - Run the example"
