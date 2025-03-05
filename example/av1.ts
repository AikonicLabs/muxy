import path from 'path';
import fs from 'fs';
import os from 'os';
import muxy from '../src/index';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Example of using rav1e for AV1 encoding with multi-threading
async function encodeWithRav1e() {
  console.log(' AV1 Encoding Example using rav1e with multi-threading');

  const inputFile = path.join(__dirname, 'input.mp4');
  const outputFile = path.join(__dirname, 'output.mp4');

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(` Input file not found: ${inputFile}`);
    console.log('Please place a video file named "input.mp4" in the example directory');
    return;
  }

  // Get CPU count for optimal threading
  const cpuCount = os.cpus().length;
  console.log(`System has ${cpuCount} CPU cores available`);

  console.log(`Input: ${inputFile}`);
  console.log(`Output: ${outputFile}`);

  try {
    // Create a video converter with rav1e options and multi-threading
    const converter = muxy.createVideoConverter(inputFile, outputFile, {
      codec: 'librav1e', // Use rav1e encoder
      format: 'mp4', // Output format
      pixFmt: 'yuv420p', // Pixel format
      // rav1e specific options - optimized for speed
      speed: 10, // Maximum speed (0-10, higher is faster)
      tileColumns: Math.min(6, Math.ceil(cpuCount / 2)), // More tile columns for better parallelization
      tileRows: Math.min(6, Math.ceil(cpuCount / 4)), // More tile rows for better parallelization
      threads: cpuCount, // Use all available CPU cores
      qp: 80, // Lower quality for faster encoding (0-255, higher is lower quality)
      keyframeInterval: 240, // Keyframe interval
      // Additional speed optimizations
      lowLatency: true, // Enable low latency mode
      // Reduce resolution for testing if needed
      // scale: { width: 640, height: 360 }
    });

    // Listen for progress events
    converter.on('progress', progress => {
      const percent = progress.percent.toFixed(1);
      const fps = progress.fps.toFixed(1);
      process.stdout.write(`\rEncoding: ${percent}% complete (${fps} fps) - ${progress.time}`);
    });

    // Listen for error events
    converter.on('error', error => {
      console.error(`\n Encoding error: ${error.message}`);
    });

    // Listen for completion event
    converter.on('complete', result => {
      console.log('\n Encoding complete!');
      console.log(`Output file: ${result.outputFile}`);

      // Get file size
      const stats = fs.statSync(result.outputFile);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`File size: ${fileSizeMB} MB`);
    });

    console.log('Starting AV1 encoding with rav1e using multi-threading...');
    await converter.start();
  } catch (error) {
    console.error(`\n Error: ${error.message}`);
  }
}

// Alternative method using the Promise-based API
async function encodeWithRav1ePromise() {
  console.log(' AV1 Encoding Example using Promise-based API');

  const inputFile = path.join(__dirname, 'input.mp4');
  const outputFile = path.join(__dirname, 'output_promise.mp4');

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(` Input file not found: ${inputFile}`);
    console.log('Please place a video file named "input.mp4" in the example directory');
    return;
  }

  // Get CPU count for optimal threading
  const cpuCount = os.cpus().length;

  try {
    console.log('Starting AV1 encoding with Promise-based API...');
    
    // Use the Promise-based API with progress callback
    const result = await muxy.convertVideo(
      inputFile, 
      outputFile, 
      {
        codec: 'librav1e',
        format: 'mp4',
        pixFmt: 'yuv420p',
        speed: 10,
        tileColumns: Math.min(6, Math.ceil(cpuCount / 2)),
        tileRows: Math.min(6, Math.ceil(cpuCount / 4)),
        threads: cpuCount,
        qp: 80,
        lowLatency: true,
      },
      (progress) => {
        const percent = progress.percent.toFixed(1);
        const fps = progress.fps.toFixed(1);
        process.stdout.write(`\rEncoding (Promise): ${percent}% complete (${fps} fps) - ${progress.time}`);
      }
    );

    console.log('\n Encoding complete!');
    console.log(`Output file: ${result.outputFile}`);
  } catch (error) {
    console.error(`\n Error: ${error.message}`);
  }
}

// Main function
async function main() {
  console.log('=== Muxy AV1 Encoding Example with Multi-threading ===');
  
  // Choose which method to run
  await encodeWithRav1e();
  // Uncomment to run the Promise-based example
  // await encodeWithRav1ePromise();
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
