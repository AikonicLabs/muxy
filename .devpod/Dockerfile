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

# Install Rust using rustup and install rav1e
RUN apt update && apt install -y curl build-essential
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup default stable
RUN cargo install rav1e

# Make rav1e globally available
RUN cp /root/.cargo/bin/rav1e /usr/local/bin/

# Install pnpm
RUN npm install -g pnpm

# Create a non-root user with sudo access
ARG USERNAME=devpod
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && apt-get update \
    && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Set up working directory
WORKDIR /workspace

# Set the default user
USER $USERNAME
