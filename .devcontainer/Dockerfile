FROM node:20-slim

# Install basic development tools
RUN apt update && apt install -y git procps curl

# Install ffmpeg (required for media conversion)
RUN apt update && apt install -y ffmpeg

# Install pnpm
RUN npm install -g pnpm

# Set up working directory
WORKDIR /workspace

# Set the user to node
USER node
