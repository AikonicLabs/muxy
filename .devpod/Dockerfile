FROM node:20-slim

# Install basic development tools
RUN apt update && apt install -y git procps curl wget sudo

# Install ffmpeg (required for media conversion)
RUN apt update && apt install -y ffmpeg

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
