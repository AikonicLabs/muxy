import path from 'path';
import fs from 'fs';
import os from 'os';
import muxy from '../src/index';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Example of using VP9 encoding with multi-threading
async function encodeWithVP9() {
  console.log(' VP9 Encoding Example with multi-threading');

  const inputFile = path.join(__dirname, 'input.mp4');
  const outputFile = path.join(__dirname, 'output-vp9.webm');

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
    // Create a video converter with VP9 options and multi-threading
    const converter = muxy.createVideoConverter(inputFile, outputFile, {
      codec: 'libvpx-vp9', // Use VP9 encoder
      format: 'webm',      // WebM container format
      pixFmt: 'yuv420p',   // Pixel format
      // VP9 specific options - optimized for speed vs quality balance
      crf: 30,             // Quality level (0-63, lower is higher quality)
      speed: 2,            // Encoding speed (0-5, higher is faster)
      threads: cpuCount,   // Use all available CPU cores
      // Additional options for better performance
      tileColumns: Math.min(6, Math.ceil(Math.log2(cpuCount))), // Tile columns based on CPU count
      tileRows: 1,         // Tile rows (0-2)
      frameParallel: 1,    // Frame parallel mode (0-1)
      // Row-based multi-threading
      rowMt: 1,            // Enable row-based multi-threading (0-1)
      // Keyframe settings
      keyframeInterval: 240, // Keyframe interval
      // Optional: reduce resolution for testing
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

    console.log('Starting VP9 encoding using multi-threading...');
    await converter.start();
  } catch (error) {
    console.error(`\n Error: ${error.message}`);
  }
}

// Alternative method using the Promise-based API
async function encodeWithVP9Promise() {
  console.log(' VP9 Encoding Example using Promise-based API');

  const inputFile = path.join(__dirname, 'input.mp4');
  const outputFile = path.join(__dirname, 'output-vp9-promise.webm');

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(` Input file not found: ${inputFile}`);
    console.log('Please place a video file named "input.mp4" in the example directory');
    return;
  }

  // Get CPU count for optimal threading
  const cpuCount = os.cpus().length;

  try {
    console.log('Starting VP9 encoding using Promise-based API...');
    
    // Use the Promise-based API with progress callback
    const result = await muxy.convertVideo(
      inputFile, 
      outputFile, 
      {
        codec: 'libvpx-vp9',
        format: 'webm',
        pixFmt: 'yuv420p',
        crf: 30,
        speed: 2,
        threads: cpuCount,
        tileColumns: Math.min(6, Math.ceil(Math.log2(cpuCount))),
        tileRows: 1,
        frameParallel: 1,
        rowMt: 1,
        keyframeInterval: 240,
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

// Two-pass encoding example for higher quality
async function encodeWithVP9TwoPass() {
  console.log(' VP9 Two-Pass Encoding Example');

  const inputFile = path.join(__dirname, 'input.mp4');
  const outputFile = path.join(__dirname, 'output-vp9-2pass.webm');
  const passLogFile = path.join(__dirname, 'vp9-2pass');

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
    console.log('\nStarting VP9 encoding - Pass 1 (Analysis)...');
    const pass1Options = {
      codec: 'libvpx-vp9',
      format: 'null',     // No output file for first pass
      pixFmt: 'yuv420p',
      pass: 1,            // First pass
      passLogFile,        // Log file for two-pass encoding
      bitrate: '0',       // Ignored in pass 1
      threads: cpuCount,
      speed: 4,           // Can use higher speed for first pass
      tileColumns: Math.min(6, Math.ceil(Math.log2(cpuCount))),
      rowMt: 1,
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
    console.log('\nStarting VP9 encoding - Pass 2 (Encoding)...');
    const pass2Options = {
      codec: 'libvpx-vp9',
      format: 'webm',
      pixFmt: 'yuv420p',
      pass: 2,            // Second pass
      passLogFile,        // Same log file as first pass
      bitrate: '1M',      // Target bitrate
      minrate: '500k',    // Minimum bitrate
      maxrate: '1.5M',    // Maximum bitrate
      bufsize: '2M',      // Buffer size
      threads: cpuCount,
      speed: 1,           // Lower speed for better quality in second pass
      tileColumns: Math.min(6, Math.ceil(Math.log2(cpuCount))),
      tileRows: 1,
      frameParallel: 1,
      rowMt: 1,
      keyframeInterval: 240,
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
  console.log('=== Muxy VP9 Encoding Example ===');
  
  // Choose which method to run
  await encodeWithVP9();
  // Uncomment to run the Promise-based example
  // await encodeWithVP9Promise();
  // Uncomment to run the two-pass encoding example
  // await encodeWithVP9TwoPass();
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
