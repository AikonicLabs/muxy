# DevPod Configuration for Muxy

This directory contains the configuration files for DevPod, a tool that allows developers to create consistent development environments across different machines and cloud providers.

## Files

- `Dockerfile`: Defines the container image with Node.js, ffmpeg, and other dependencies
- `devcontainer.json`: Configuration for VS Code when used with DevPod

## Usage

1. Install DevPod from [devpod.sh](https://devpod.sh/)
2. Open DevPod and create a new workspace pointing to the Muxy repository
3. Alternatively, run `devpod up` from the project directory

## Available Tasks

The following tasks are defined in the `devpod.yaml` file:

- `install`: Install dependencies with pnpm
- `build`: Build the project
- `test-ffmpeg`: Test if ffmpeg is correctly installed
- `container-test`: Create a test video file for examples
- `run-example`: Run the example

You can run these tasks with:

```bash
devpod task <task-name>
```

## Customization

You can customize the DevPod configuration by editing the `devpod.yaml` file in the root directory of the project.
