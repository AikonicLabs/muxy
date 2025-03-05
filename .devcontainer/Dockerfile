FROM node:20-slim

# Add non-free repositories for libfdk-aac-dev and other media packages
RUN apt update && apt install -y apt-transport-https ca-certificates gnupg
RUN echo "deb http://deb.debian.org/debian bookworm main contrib non-free" > /etc/apt/sources.list.d/debian-non-free.list
RUN echo "deb http://deb.debian.org/debian bookworm-updates main contrib non-free" >> /etc/apt/sources.list.d/debian-non-free.list
RUN echo "deb http://security.debian.org/debian-security bookworm-security main contrib non-free" >> /etc/apt/sources.list.d/debian-non-free.list

# Install FFmpeg and development tools
RUN apt update && apt install -y git procps curl wget \
    ffmpeg libavcodec-dev libavformat-dev libavutil-dev \
    libswscale-dev libswresample-dev libavfilter-dev \
    libx264-dev libx265-dev libvpx-dev libopus-dev libass-dev libmp3lame-dev

# Try to install libfdk-aac-dev, but don't fail if it's not available
RUN apt update && apt install -y libfdk-aac-dev || echo "libfdk-aac-dev not available, continuing without it"

# Install build dependencies for SVT-AV1
RUN apt update && apt install -y cmake build-essential yasm

# Install Rust using rustup and install rav1e
RUN apt update && apt install -y curl build-essential
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup default stable
RUN cargo install rav1e

# Install SVT-AV1
RUN cd /tmp && \
    git clone --depth 1 https://gitlab.com/AOMediaCodec/SVT-AV1.git && \
    cd SVT-AV1 && \
    mkdir build && \
    cd build && \
    cmake .. -G"Unix Makefiles" -DCMAKE_BUILD_TYPE=Release && \
    make -j$(nproc) && \
    make install && \
    ldconfig && \
    cd / && \
    rm -rf /tmp/SVT-AV1

# Make SVT-AV1 binary available in PATH
RUN cp /usr/local/bin/SvtAv1EncApp /usr/bin/ || echo "SvtAv1EncApp not found in /usr/local/bin"

# Install pnpm
RUN npm install -g pnpm

# Set up working directory
WORKDIR /workspace

# Make rav1e available to node user
RUN mkdir -p /home/node/.cargo/bin
RUN cp /root/.cargo/bin/rav1e /home/node/.cargo/bin/
RUN chown -R node:node /home/node/.cargo

# Set the user to node
USER node
ENV PATH="/home/node/.cargo/bin:${PATH}"
