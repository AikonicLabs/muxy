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

# Install build dependencies for SVT-AV1
echo "Installing build dependencies for SVT-AV1..."
apt-get install -y cmake build-essential yasm git

# Install Rust using rustup
echo "Installing Rust using rustup..."
apt-get install -y curl build-essential
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
export PATH="$HOME/.cargo/bin:$PATH"
rustup default stable

# Install rav1e encoder
echo "Installing rav1e encoder..."
cargo install rav1e

# Install SVT-AV1
echo "Installing SVT-AV1 encoder..."
cd /tmp
git clone --depth 1 https://gitlab.com/AOMediaCodec/SVT-AV1.git
cd SVT-AV1
mkdir -p build
cd build
cmake .. -G"Unix Makefiles" -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)
make install
ldconfig
cd /
rm -rf /tmp/SVT-AV1

# Make rav1e globally available
echo "Making rav1e globally available..."
cp "$HOME/.cargo/bin/rav1e" /usr/local/bin/
chmod +x /usr/local/bin/rav1e

# Make SVT-AV1 binary globally available
echo "Making SVT-AV1 globally available..."
cp /usr/local/bin/SvtAv1EncApp /usr/bin/
chmod +x /usr/bin/SvtAv1EncApp

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

# Check SVT-AV1
echo "Checking SVT-AV1 installation..."
if command -v SvtAv1EncApp &> /dev/null; then
    echo "SVT-AV1 is installed"
    SvtAv1EncApp --help | head -n 2
else
    echo "Warning: SVT-AV1 is not in PATH"
fi

# Check available AV1 encoders in FFmpeg
echo "Checking available AV1 encoders in FFmpeg..."
ffmpeg -encoders | grep AV1

echo "===== Installation complete ====="
echo "You can now use FFmpeg with AV1 encoding support."
echo "Run 'node scripts/check-ffmpeg-rav1e.js' to verify the installation."
