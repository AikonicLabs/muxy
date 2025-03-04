# Muxy - Encode Smarter 🚀

Muxy is a **next-gen media conversion library** that seamlessly converts **images and videos** into the most popular formats with **speed and efficiency**. Whether you're working with **images** (JPEG, PNG, WebP) or **videos** (H.264, H.265, AV1, VP8, VP9, HLS, DASH), Muxy has got you covered.

---

## ✨ Features

✅ **Universal Image Converter** – Convert any image format to **JPEG, PNG, WebP**.  
✅ **Advanced Video Encoding** – Supports **H.264, H.265, AV1, VP8, VP9**.  
✅ **Adaptive Streaming Ready** – Convert videos to **HLS & DASH** for seamless streaming.  
✅ **Blazing Fast Performance** – Optimized for speed and efficiency.  
✅ **Event-Based API** – Modern event-driven architecture with `.on()` methods.  
✅ **Progress Tracking** – Monitor conversion progress in real-time.  
✅ **Lightweight & Scalable** – Designed to work smoothly across applications.  
✅ **Dual API Support** – Both promise-based and event-based APIs available.

---

## 📦 Installation

### Install Muxy via **pnpm**
```sh
pnpm install @aikonlabs/muxy
```

or using **npm**
```sh
npm install @aikonlabs/muxy
```

or using **Yarn**
```sh
yarn add @aikonlabs/muxy
```

## 🚀 Quick Start

### Import Muxy
```ts
import muxy from '@aikonlabs/muxy';
```

### Convert a Video with Event-Based API
```ts
import muxy from '@aikonlabs/muxy';

// Create a converter instance
const converter = muxy.convertVideo('input.mp4', 'output.mp4', { 
  codec: 'h264',
  preset: 'slow'
});

// Listen for events
converter.on('progress', (progress) => {
  console.log(`Progress: ${progress.percent}%`);
});

converter.on('error', (error) => {
  console.error('Error:', error);
});

converter.on('end', (result) => {
  console.log(`Conversion completed in ${result.duration} seconds`);
});

// Start the conversion
converter.start();
```

### Convert a Video with Promise API
```ts
import muxy from '@aikonlabs/muxy';

// Create a converter instance
const converter = muxy.convertVideo('input.mp4', 'output.mp4', { 
  codec: 'h265' 
});

// Start the conversion and use Promise API
converter.start()
  .then(result => {
    console.log(`Conversion completed in ${result.duration} seconds`);
  })
  .catch(error => {
    console.error('Conversion failed:', error);
  });
```

### Convert an Image
```ts
import muxy from '@aikonlabs/muxy';

// Create an image converter
const converter = muxy.convertImage('input.jpg', 'output.png');

// Listen for events
converter.on('progress', (progress) => {
  console.log(`Progress: ${progress.percent}%`);
});

converter.on('end', (result) => {
  console.log('Image conversion completed');
});

// Start the conversion
converter.start();
```

### Convert a Video to HLS
```ts
import muxy from '@aikonlabs/muxy';

// Create an HLS converter
const converter = muxy.convertToHLS('input.mp4', 'hls_output', { 
  codec: 'h265' 
});

// Listen for events
converter.on('progress', (progress) => {
  console.log(`Progress: ${progress.percent}%`);
});

converter.on('end', (result) => {
  console.log('HLS conversion completed');
});

// Start the conversion
converter.start();
```

## 📋 API Reference

### muxy.convertVideo(inputFile, outputFile, options)

Creates a video converter instance.

**Parameters:**
- `inputFile` (string): Path to the input file
- `outputFile` (string): Path to the output file
- `options` (object): Conversion options
  - `format` (string): Output format (mp4, webm, etc.)
  - `codec` (string): Video codec (h264, h265, vp9, etc.)
  - `preset` (string): Encoding preset (ultrafast, fast, medium, slow, etc.)
  - `width` (number): Output width
  - `height` (number): Output height
  - `bitrate` (string): Video bitrate (e.g., '2M')
  - `quality` (number): Quality setting (0-100)

**Returns:** Converter instance with event emitters

### muxy.convertImage(inputFile, outputFile, options)

Creates an image converter instance.

**Parameters:** Same as convertVideo

**Returns:** Converter instance with event emitters

### muxy.convertToHLS(inputFile, outputDirectory, options)

Creates an HLS converter instance.

**Parameters:** Similar to convertVideo with `outputDirectory` instead of `outputFile`

**Returns:** Converter instance with event emitters

### Converter Events

The Converter instance emits the following events:

- **progress**: Emitted during conversion with progress information
  ```ts
  converter.on('progress', (progress) => {
    // progress.percent: Percentage complete (0-100)
    // progress.frame: Current frame number
    // progress.fps: Frames per second
    // progress.time: Current timestamp in format HH:MM:SS.MS
  });
  ```

- **error**: Emitted when an error occurs
  ```ts
  converter.on('error', (error) => {
    // error: Error object with message
  });
  ```

- **end**: Emitted when conversion completes successfully
  ```ts
  converter.on('end', (result) => {
    // result.inputFile: Input file path
    // result.outputFile: Output file path
    // result.options: Options used for conversion
    // result.duration: Time taken in seconds
    // result.success: Always true when 'end' is emitted
  });
  ```

### Converter Methods

- **start()**: Starts the conversion process
  ```ts
  converter.start().then(result => {
    // Same result object as in 'end' event
  });
  ```

### Combining Promise and Event-based Approaches

You can also combine both approaches to get the best of both worlds:

```typescript
import muxy from '@aikonlabs/muxy';

const converter = muxy.createVideoConverter('input.mp4', 'output.mp4', {
  codec: 'libx264',
  preset: 'fast'
});

// Set up event listeners for real-time progress
converter.on('progress', (progress) => {
  console.log(`Progress: ${progress.percent}%`);
});

// Use promise for completion
converter.start()
  .then(result => {
    console.log(`Conversion completed in ${result.duration} seconds`);
  })
  .catch(error => {
    console.error('Conversion failed:', error.message);
  });
```

## Development

### Using DevPod

This project includes a DevPod configuration for creating consistent development environments across different machines and cloud providers.

#### Prerequisites

- [DevPod](https://devpod.sh/) installed on your machine
- Docker or another supported provider

#### Getting Started with DevPod

1. Install DevPod from [devpod.sh](https://devpod.sh/)
2. Clone the repository
3. Open DevPod and create a new workspace pointing to the cloned repository
4. Alternatively, run the following command from the project directory:
   ```bash
   devpod up
   ```
5. DevPod will build the container and open the project inside it
6. All dependencies, including ffmpeg, will be automatically installed

#### Available DevPod Tasks

DevPod comes with predefined tasks that you can run:

```bash
# Install dependencies
devpod task install

# Build the project
devpod task build

# Test if ffmpeg is correctly installed
devpod task test-ffmpeg

# Create a test video file for examples
devpod task container-test

# Run the example
devpod task run-example
```

### Using Dev Containers

This project includes a development container configuration that provides a consistent development environment with all required dependencies pre-installed, including ffmpeg.

#### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VS Code Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

#### Getting Started with Dev Containers

1. Clone the repository
2. Open the project in VS Code
3. When prompted, click "Reopen in Container" or run the "Remote-Containers: Reopen in Container" command from the command palette
4. VS Code will build the container and open the project inside it
5. All dependencies, including ffmpeg, will be automatically installed

The development container includes:
- Node.js 20
- ffmpeg (latest version)
- pnpm package manager
- Git and other development tools

#### Running the Examples

Once inside the container, you can run the examples:

```bash
# Build the project
pnpm build

# Test if ffmpeg is correctly installed
pnpm test:ffmpeg

# Create a test video file for examples
pnpm container:test

# Run the example
pnpm example
```

## License

MIT