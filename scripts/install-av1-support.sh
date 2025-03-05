#!/bin/bash

# Script to install FFmpeg with AV1 support using prebuilt packages
# This script should be run with sudo or as root

set -e

echo "===== Installing FFmpeg with AV1 encoder support ====="

# Update package lists
apt-get update

# Install FFmpeg and development packages
echo "Installing FFmpeg and development packages..."
apt-get install -y ffmpeg libavcodec-dev libavformat-dev libavutil-dev \
  libswscale-dev libswresample-dev libavfilter-dev

# Install dependencies for AV1 encoding
echo "Installing dependencies for AV1 encoding..."
apt-get install -y libx264-dev libx265-dev libvpx-dev libopus-dev libass-dev libmp3lame-dev

# Install Rust using rustup
echo "Installing Rust using rustup..."
apt-get install -y curl build-essential
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
export PATH="$HOME/.cargo/bin:$PATH"
rustup default stable

# Install rav1e encoder
echo "Installing rav1e encoder..."
cargo install rav1e

# Make rav1e globally available
echo "Making rav1e globally available..."
cp "$HOME/.cargo/bin/rav1e" /usr/local/bin/
chmod +x /usr/local/bin/rav1e

# Add rav1e to PATH in user profile
echo "Adding rav1e to PATH..."
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc

# Verify installations
echo "===== Verifying installations ====="

# Check FFmpeg
echo "Checking FFmpeg installation..."
ffmpeg -version

# Check rav1e
echo "Checking rav1e installation..."
if command -v rav1e &> /dev/null; then
    echo "rav1e is installed:"
    rav1e --version
else
    echo "Warning: rav1e is not in PATH. It may be available at $HOME/.cargo/bin/rav1e"
fi

# Check available AV1 encoders
echo "Checking available AV1 encoders in FFmpeg..."
ffmpeg -encoders | grep AV1

echo "===== Installation complete ====="
echo "You can now use FFmpeg with AV1 encoding support."
echo "Run 'node scripts/check-ffmpeg-rav1e.js' to verify the installation."
