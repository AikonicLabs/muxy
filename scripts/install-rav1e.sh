#!/bin/bash

# Script to build and install rav1e library from source
# This script should be run with sudo or as root

set -e

echo "===== Installing rav1e AV1 encoder library ====="

# Install dependencies
echo "Installing dependencies..."
apt-get update
apt-get install -y git curl build-essential pkg-config

# Install Rust if not already installed
if ! command -v rustc &> /dev/null; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
    rustup default stable
fi

# Clone rav1e repository
echo "Cloning rav1e repository..."
cd /tmp
rm -rf rav1e
git clone https://github.com/xiph/rav1e.git
cd rav1e

# Build rav1e
echo "Building rav1e..."
cargo build --release

# Install the binary
echo "Installing rav1e binary..."
cp target/release/rav1e /usr/local/bin/

# Create include directory and copy headers
echo "Installing rav1e headers..."
mkdir -p /usr/local/include/rav1e
cp -r include/* /usr/local/include/rav1e/

# Install library files
echo "Installing rav1e library files..."
if [ -f target/release/librav1e.so ]; then
    cp target/release/librav1e.so /usr/local/lib/
elif [ -f target/release/librav1e.a ]; then
    cp target/release/librav1e.a /usr/local/lib/
else
    echo "Warning: Could not find library files, continuing with binary only"
fi

# Create pkg-config file
echo "Creating pkg-config file..."
mkdir -p /usr/local/lib/pkgconfig
cat > /usr/local/lib/pkgconfig/rav1e.pc << EOF
prefix=/usr/local
exec_prefix=\${prefix}
libdir=\${prefix}/lib
includedir=\${prefix}/include

Name: rav1e
Description: An AV1 encoder focused on speed and safety
Version: 0.6.6
Libs: -L\${libdir} -lrav1e
Cflags: -I\${includedir}
EOF

# Update library cache
echo "Updating library cache..."
ldconfig

echo "===== rav1e installation complete ====="
echo "You can now build FFmpeg with rav1e support using:"
echo "PKG_CONFIG_PATH=/usr/local/lib/pkgconfig ./configure --enable-librav1e ..."

# Test installation
echo "Testing rav1e installation..."
if command -v rav1e &> /dev/null; then
    echo "rav1e binary is available:"
    rav1e --version
else
    echo "Warning: rav1e binary not found in PATH"
fi

if pkg-config --exists rav1e; then
    echo "rav1e pkg-config is available:"
    pkg-config --modversion rav1e
else
    echo "Warning: rav1e pkg-config not available"
fi

echo "===== Installation script completed ====="
