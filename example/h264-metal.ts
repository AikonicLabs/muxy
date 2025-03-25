import path from 'path';
import fs from 'fs';
import os from 'os';
import muxy from '../src/index';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check if running on macOS
const isMac = process.platform === 'darwin';

// Function to check if videotoolbox is available
function isVideoToolboxAvailable() {
  try {
    const output = execSync('ffmpeg -encoders | grep videotoolbox').toString();
    return output.includes('videotoolbox');
  } catch (error) {
    return false;
  }
}

// Example of using H.264 encoding with Metal GPU acceleration on Mac
async function encodeWithH264Metal() {
  console.log(' H.264 Encoding Example with Metal GPU acceleration on Mac');

  if (!isMac) {
    console.error('This example requires macOS with Metal GPU support');
    return;
  }

  const hasVideoToolbox = isVideoToolboxAvailable();
  if (!hasVideoToolbox) {
    console.error('VideoToolbox encoder not available in FFmpeg');
    console.error('Make sure FFmpeg is compiled with VideoToolbox support');
    return;
  }

  const inputFile = path.join(__dirname, 'input.mp4');
  const outputFile = path.join(__dirname, 'output-h264-metal.mp4');

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(` Input file not found: ${inputFile}`);
    console.log('Please place a video file named "input.mp4" in the example directory');
    return;
  }

  console.log(`Input: ${inputFile}`);
  console.log(`Output: ${outputFile}`);

  try {
    // Create a video converter with H.264 VideoToolbox options
    const converter = muxy.createVideoConverter(inputFile, outputFile, {
      codec: 'h264_videotoolbox', // Use Metal-accelerated H.264 encoder
      format: 'mp4',              // MP4 container format
      pixFmt: 'yuv420p',          // Pixel format
      // VideoToolbox specific options
      bitrate: '1000k',           // Target bitrate (1000 kbps)
      maxrate: '1200k',           // Maximum bitrate
      bufsize: '2000k',           // Buffer size
      // VideoToolbox quality preset (available on newer macOS versions)
      // Options: default, low, medium, high, veryHigh
      profile: 'high',            // H.264 profile
      level: '4.1',               // H.264 level
      // Keyframe settings
      keyframeInterval: 48,       // Keyframe interval (2 seconds at 24fps)
      // Optional: reduce resolution for testing
      // scale: { width: 1280, height: 720 }
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

    console.log('Starting H.264 encoding with Metal GPU acceleration...');
    await converter.start();
  } catch (error) {
    console.error(`\n Error: ${error.message}`);
  }
}

// Alternative method using the Promise-based API
async function encodeWithH264MetalPromise() {
  console.log(' H.264 Metal GPU Encoding Example using Promise-based API');

  if (!isMac) {
    console.error('This example requires macOS with Metal GPU support');
    return;
  }

  const hasVideoToolbox = isVideoToolboxAvailable();
  if (!hasVideoToolbox) {
    console.error('VideoToolbox encoder not available in FFmpeg');
    console.error('Make sure FFmpeg is compiled with VideoToolbox support');
    return;
  }

  const inputFile = path.join(__dirname, 'input.mp4');
  const outputFile = path.join(__dirname, 'output-h264-metal-promise.mp4');

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(` Input file not found: ${inputFile}`);
    console.log('Please place a video file named "input.mp4" in the example directory');
    return;
  }

  try {
    console.log('Starting H.264 encoding with Metal GPU using Promise-based API...');
    
    // Use the Promise-based API with progress callback
    const result = await muxy.convertVideo(
      inputFile, 
      outputFile, 
      {
        codec: 'h264_videotoolbox',
        format: 'mp4',
        pixFmt: 'yuv420p',
        bitrate: '1000k',
        maxrate: '1200k',
        bufsize: '2000k',
        profile: 'high',
        level: '4.1',
        keyframeInterval: 48,
      },
      (progress) => {
        const percent = progress.percent.toFixed(1);
        const fps = progress.fps.toFixed(1);
        process.stdout.write(`\rEncoding (Promise): ${percent}% complete (${fps} fps) - ${progress.time}`);
      }
    );

    console.log('\n Encoding complete!');
    console.log(`Output file: ${result.outputFile}`);
    
    // Get file size
    const stats = fs.statSync(result.outputFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`File size: ${fileSizeMB} MB`);
  } catch (error) {
    console.error(`\n Error: ${error.message}`);
  }
}

// HEVC (H.265) encoding with Metal GPU acceleration
async function encodeWithHEVCMetal() {
  console.log(' HEVC (H.265) Encoding Example with Metal GPU acceleration');

  if (!isMac) {
    console.error('This example requires macOS with Metal GPU support');
    return;
  }

  // Check if HEVC VideoToolbox encoder is available
  let hasHEVCEncoder = false;
  try {
    const output = execSync('ffmpeg -encoders | grep hevc_videotoolbox').toString();
    hasHEVCEncoder = output.includes('hevc_videotoolbox');
  } catch (error) {
    // Ignore error
  }

  if (!hasHEVCEncoder) {
    console.error('HEVC VideoToolbox encoder not available in FFmpeg');
    console.error('Make sure FFmpeg is compiled with HEVC VideoToolbox support');
    return;
  }

  const inputFile = path.join(__dirname, 'input.mp4');
  const outputFile = path.join(__dirname, 'output-hevc-metal.mp4');

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(` Input file not found: ${inputFile}`);
    console.log('Please place a video file named "input.mp4" in the example directory');
    return;
  }

  console.log(`Input: ${inputFile}`);
  console.log(`Output: ${outputFile}`);

  try {
    // Create a video converter with HEVC VideoToolbox options
    const converter = muxy.createVideoConverter(inputFile, outputFile, {
      codec: 'hevc_videotoolbox', // Use Metal-accelerated HEVC encoder
      format: 'mp4',              // MP4 container format
      pixFmt: 'yuv420p',          // Pixel format
      // VideoToolbox specific options
      bitrate: '1000k',           // Target bitrate (1000 kbps)
      maxrate: '1200k',           // Maximum bitrate
      bufsize: '2000k',           // Buffer size
      // HEVC specific options
      tag: 'hvc1',                // Use hvc1 tag for better compatibility
      // Keyframe settings
      keyframeInterval: 48,       // Keyframe interval (2 seconds at 24fps)
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

    console.log('Starting HEVC encoding with Metal GPU acceleration...');
    await converter.start();
  } catch (error) {
    console.error(`\n Error: ${error.message}`);
  }
}

// Main function
async function main() {
  console.log('=== Muxy Metal GPU Acceleration Example on Mac ===');
  
  // Choose which method to run
  await encodeWithH264Metal();
  // Uncomment to run the Promise-based example
  // await encodeWithH264MetalPromise();
  // Uncomment to run the HEVC encoding example
  // await encodeWithHEVCMetal();
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
