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

## Advanced Codec Support

### AV1 Encoding with rav1e

Muxy supports AV1 encoding using [rav1e](https://github.com/xiph/rav1e), a fast and safe AV1 encoder written in Rust. This provides an efficient alternative to libaom-av1 for AV1 encoding.

#### Prerequisites

To use rav1e with Muxy, you need:

1. FFmpeg compiled with librav1e support
2. rav1e installed on your system

#### Installation

**macOS:**
```bash
brew install rav1e
brew install ffmpeg --with-librav1e
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install rav1e
sudo apt-get install ffmpeg
```

**From Source:**
Follow the [rav1e installation instructions](https://github.com/xiph/rav1e#installing).

#### Usage

```typescript
import muxy from '@aikonlabs/muxy';

// Event-based API
const converter = muxy.createVideoConverter('input.mp4', 'output.mp4', {
  codec: 'librav1e',      // Use rav1e encoder
  format: 'mp4',          // Output format
  pixFmt: 'yuv420p',      // Pixel format
  // rav1e specific options
  speed: 6,               // Encoding speed (0-10, higher is faster)
  tileColumns: 2,         // Number of tile columns
  tileRows: 2,            // Number of tile rows
  bitrate: '2M',          // Target bitrate
  keyframeInterval: 240   // Keyframe interval
});

converter.on('progress', (progress) => {
  console.log(`Progress: ${progress.percent}%`);
});

converter.on('complete', (result) => {
  console.log('Conversion complete!', result);
});

await converter.start();

// Promise-based API
const result = await muxy.convertVideo('input.mp4', 'output.mp4', {
  codec: 'librav1e',
  format: 'mp4',
  pixFmt: 'yuv420p',
  speed: 6,
  tileColumns: 2,
  tileRows: 2,
  bitrate: '2M',
  keyframeInterval: 240
});
```

#### rav1e-specific Options

| Option | Description | Default |
|--------|-------------|---------|
| `speed` | Encoding speed (0-10, higher is faster) | 6 |
| `tileColumns` | Number of tile columns | 1 |
| `tileRows` | Number of tile rows | 1 |
| `threads` | Number of threads to use for encoding | CPU core count |
| `keyframeInterval` | Keyframe interval | 240 |

#### Multi-threading with rav1e

By default, rav1e may only use a single CPU core when encoding through FFmpeg. Muxy automatically enables multi-threading by:

1. Setting the `threads` parameter to use all available CPU cores
2. Enabling row multi-threading with `-row-mt 1`
3. Using tile-based parallelism with `tileColumns` and `tileRows`

To optimize performance for your specific hardware:

```typescript
import os from 'os';

// Get available CPU cores
const cpuCount = os.cpus().length;

const converter = muxy.createVideoConverter('input.mp4', 'output.mp4', {
  codec: 'librav1e',
  // Use all available CPU cores
  threads: cpuCount,
  // Optimize tile configuration based on resolution
  // For 1080p, 2x2 tiles work well
  tileColumns: 2,
  tileRows: 2
});
```

For very high-resolution content (4K+), consider increasing the tile configuration:

```typescript
const converter = muxy.createVideoConverter('input.mp4', 'output.mp4', {
  codec: 'librav1e',
  threads: cpuCount,
  // For 4K content, more tiles can help
  tileColumns: 4,
  tileRows: 4
});
```

#### Benchmarking AV1 Encoding Performance

Muxy includes a benchmarking tool to compare single-threaded vs multi-threaded AV1 encoding performance. This helps you understand the performance gains from multi-threading on your specific hardware.

To run the benchmark:

```bash
# Run the AV1 benchmark
pnpm benchmark:av1
```

The benchmark will:
1. Encode a short video clip using single-threaded mode
2. Encode the same clip using all available CPU cores
3. Compare encoding times, speedup factor, and file sizes
4. Report efficiency as a percentage of perfect linear scaling

Sample benchmark output:
```
=== System Information ===
CPU Cores: 8
Architecture: x64
Platform: darwin
Node.js: v20.10.0
Total Memory: 16 GB
Free Memory: 4 GB

=== Single-Threaded AV1 Encoding Benchmark ===
Output: /path/to/benchmark/single-threaded.mp4
Progress: 10% (12 fps) - Elapsed: 10.5s
...
✅ Single-threaded encoding complete in 120.45 seconds
File size: 2.34 MB

=== Multi-Threaded AV1 Encoding Benchmark ===
Output: /path/to/benchmark/multi-threaded.mp4
Using 8 CPU cores
Progress: 10% (78 fps) - Elapsed: 1.8s
...
✅ Multi-threaded encoding complete in 18.72 seconds
File size: 2.38 MB

=== Benchmark Results ===
Single-threaded encoding time: 120.45 seconds
Multi-threaded encoding time: 18.72 seconds
Speedup factor: 6.43x
Efficiency: 80.4% of perfect linear scaling

File size comparison:
Single-threaded: 2.34 MB
Multi-threaded: 2.38 MB
Size difference: 1.71%
```

#### Verifying FFmpeg and rav1e Support

To check if your FFmpeg installation is properly configured with librav1e support and multi-threading capabilities:

```bash
# Check FFmpeg and rav1e compatibility
pnpm test:ffmpeg-rav1e
```

This will verify:
- If FFmpeg is installed
- If rav1e is installed
- If FFmpeg is compiled with librav1e support
- Available AV1 encoders
- Multi-threading support
- System resources for encoding

#### Example

See the [av1.ts](./example/av1.ts) example for a complete demonstration of AV1 encoding with rav1e using multi-threading.

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

This project includes a development container configuration that provides a consistent development environment with all required dependencies pre-installed, including ffmpeg with librav1e support.

#### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VS Code Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

#### Getting Started with Dev Containers

1. Clone the repository
2. Open the project in VS Code
3. When prompted, click "Reopen in Container" or run the "Remote-Containers: Reopen in Container" command from the command palette
4. VS Code will build the container and open the project inside it
5. All dependencies, including ffmpeg with librav1e support, will be automatically installed

The development container includes:
- Node.js 20
- FFmpeg compiled from source with librav1e support
- rav1e installed from source
- pnpm package manager
- Git and other development tools

#### Running the Examples

Once inside the container, you can run the examples:

```bash
# Build the project
pnpm build

# Test if ffmpeg is correctly installed with rav1e support
pnpm test:ffmpeg-rav1e

# Run the AV1 example
pnpm example:av1

# Run the AV1 benchmark
pnpm benchmark:av1
```

## License

MIT