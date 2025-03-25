import path from 'path';
import fs from 'fs';
import os from 'os';
import muxy from '../src/index';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Example of using H.264 encoding with 1000 kbps bitrate
async function encodeWithH264() {
  console.log(' H.264 Encoding Example with 1000 kbps bitrate');

  const inputFile = path.join(__dirname, 'input.mp4');
  const outputFile = path.join(__dirname, 'output-h264.mp4');

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
    // Create a video converter with H.264 options and fixed bitrate
    const converter = muxy.createVideoConverter(inputFile, outputFile, {
      codec: 'libx264',     // Use H.264 encoder
      format: 'mp4',        // MP4 container format
      pixFmt: 'yuv420p',    // Pixel format
      // H.264 specific options
      preset: 'medium',     // Encoding preset (ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow)
      bitrate: '1000k',     // Fixed bitrate of 1000 kbps
      maxrate: '1200k',     // Maximum bitrate
      bufsize: '2000k',     // Buffer size
      // Multi-threading options
      threads: cpuCount,    // Use all available CPU cores
      // GOP settings
      keyframeInterval: 48, // Keyframe interval (2 seconds at 24fps)
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

    console.log('Starting H.264 encoding with fixed bitrate...');
    await converter.start();
  } catch (error) {
    console.error(`\n Error: ${error.message}`);
  }
}

// Alternative method using the Promise-based API
async function encodeWithH264Promise() {
  console.log(' H.264 Encoding Example using Promise-based API');

  const inputFile = path.join(__dirname, 'input.mp4');
  const outputFile = path.join(__dirname, 'output-h264-promise.mp4');

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(` Input file not found: ${inputFile}`);
    console.log('Please place a video file named "input.mp4" in the example directory');
    return;
  }

  // Get CPU count for optimal threading
  const cpuCount = os.cpus().length;

  try {
    console.log('Starting H.264 encoding using Promise-based API...');
    
    // Use the Promise-based API with progress callback
    const result = await muxy.convertVideo(
      inputFile, 
      outputFile, 
      {
        codec: 'libx264',
        format: 'mp4',
        pixFmt: 'yuv420p',
        preset: 'medium',
        bitrate: '1000k',
        maxrate: '1200k',
        bufsize: '2000k',
        threads: cpuCount,
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

// Two-pass encoding example for better quality at same bitrate
async function encodeWithH264TwoPass() {
  console.log(' H.264 Two-Pass Encoding Example');

  const inputFile = path.join(__dirname, 'input.mp4');
  const outputFile = path.join(__dirname, 'output-h264-2pass.mp4');
  const passLogFile = path.join(__dirname, 'h264-2pass');

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(` Input file not found: ${inputFile}`);
    console.log('Please place a video file named "input.mp4" in the example directory');
    return;
  }

  const cpuCount = os.cpus().length;
  console.log(`System has ${cpuCount} CPU cores available`);
  console.log(`Input: ${inputFile}`);
  console.log(`Output: ${outputFile}`);

  try {
    // First pass - analysis only
    console.log('\nStarting H.264 encoding - Pass 1 (Analysis)...');
    const pass1Options = {
      codec: 'libx264',
      format: 'null',     // No output file for first pass
      pixFmt: 'yuv420p',
      pass: 1,            // First pass
      passLogFile,        // Log file for two-pass encoding
      bitrate: '1000k',   // Target bitrate
      preset: 'medium',
      threads: cpuCount,
    };

    await muxy.convertVideo(
      inputFile, 
      'pipe:', // Output to nowhere
      pass1Options,
      (progress) => {
        const percent = progress.percent.toFixed(1);
        process.stdout.write(`\rPass 1: ${percent}% complete`);
      }
    );
    
    console.log('\nPass 1 complete');

    // Second pass - actual encoding with the analysis data
    console.log('\nStarting H.264 encoding - Pass 2 (Encoding)...');
    const pass2Options = {
      codec: 'libx264',
      format: 'mp4',
      pixFmt: 'yuv420p',
      pass: 2,            // Second pass
      passLogFile,        // Same log file as first pass
      bitrate: '1000k',   // Target bitrate
      minrate: '500k',    // Minimum bitrate
      maxrate: '1500k',   // Maximum bitrate
      bufsize: '2000k',   // Buffer size
      preset: 'medium',
      threads: cpuCount,
      keyframeInterval: 48,
    };

    const result = await muxy.convertVideo(
      inputFile, 
      outputFile,
      pass2Options,
      (progress) => {
        const percent = progress.percent.toFixed(1);
        const fps = progress.fps.toFixed(1);
        process.stdout.write(`\rPass 2: ${percent}% complete (${fps} fps) - ${progress.time}`);
      }
    );

    console.log('\nPass 2 complete');
    console.log(`Output file: ${result.outputFile}`);
    
    // Get file size
    const stats = fs.statSync(result.outputFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`File size: ${fileSizeMB} MB`);

    // Clean up pass log files
    try {
      if (fs.existsSync(`${passLogFile}-0.log`)) fs.unlinkSync(`${passLogFile}-0.log`);
      if (fs.existsSync(`${passLogFile}-0.log.mbtree`)) fs.unlinkSync(`${passLogFile}-0.log.mbtree`);
    } catch (err) {
      console.log('Note: Could not clean up pass log files');
    }
  } catch (error) {
    console.error(`\n Error: ${error.message}`);
  }
}

// Main function
async function main() {
  console.log('=== Muxy H.264 Encoding Example with 1000 kbps bitrate ===');
  
  // Choose which method to run
  await encodeWithH264();
  // Uncomment to run the Promise-based example
  // await encodeWithH264Promise();
  // Uncomment to run the two-pass encoding example
  // await encodeWithH264TwoPass();
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
