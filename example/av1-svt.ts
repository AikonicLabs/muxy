import path from 'path';
import fs from 'fs';
import os from 'os';
import muxy from '../src/index';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Example of using SVT-AV1 for AV1 encoding with multi-threading
async function encodeWithSvtAv1() {
  console.log(' AV1 Encoding Example using SVT-AV1 with multi-threading');

  const inputFile = path.join(__dirname, 'input.mp4');
  const outputFile = path.join(__dirname, 'output-svtav1.mp4');

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
    // Create a video converter with SVT-AV1 options and multi-threading
    const converter = muxy.createVideoConverter(inputFile, outputFile, {
      codec: 'libsvtav1', // Use SVT-AV1 encoder
      format: 'mp4', // Output format
      pixFmt: 'yuv420p', // Pixel format
      // SVT-AV1 specific options - optimized for speed
      preset: 10, // Encoding preset (0-12, higher is faster)
      crf: 30, // Quality level (0-63, lower is higher quality)
      threads: cpuCount, // Use all available CPU cores
      // Additional options for better performance
      tileColumns: Math.min(6, Math.ceil(cpuCount / 2)), // More tile columns for better parallelization
      tileRows: Math.min(6, Math.ceil(cpuCount / 4)), // More tile rows for better parallelization
      keyframeInterval: 240, // Keyframe interval
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

    console.log('Starting AV1 encoding with SVT-AV1 using multi-threading...');
    await converter.start();
  } catch (error) {
    console.error(`\n Error: ${error.message}`);
  }
}

// Alternative method using the Promise-based API
async function encodeWithSvtAv1Promise() {
  console.log(' AV1 Encoding Example using SVT-AV1 with Promise-based API');

  const inputFile = path.join(__dirname, 'input.mp4');
  const outputFile = path.join(__dirname, 'output-svtav1-promise.mp4');

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(` Input file not found: ${inputFile}`);
    console.log('Please place a video file named "input.mp4" in the example directory');
    return;
  }

  // Get CPU count for optimal threading
  const cpuCount = os.cpus().length;

  try {
    console.log('Starting AV1 encoding with SVT-AV1 using Promise-based API...');
    
    // Use the Promise-based API with progress callback
    const result = await muxy.convertVideo(
      inputFile, 
      outputFile, 
      {
        codec: 'libsvtav1',
        format: 'mp4',
        pixFmt: 'yuv420p',
        preset: 10,
        crf: 30,
        threads: cpuCount,
        tileColumns: Math.min(6, Math.ceil(cpuCount / 2)),
        tileRows: Math.min(6, Math.ceil(cpuCount / 4)),
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

// Benchmark function to compare rav1e and SVT-AV1
async function benchmarkAv1Encoders() {
  console.log(' AV1 Encoder Benchmark: rav1e vs SVT-AV1');

  const inputFile = path.join(__dirname, 'input.mp4');
  const outputRav1e = path.join(__dirname, 'output-rav1e-bench.mp4');
  const outputSvtAv1 = path.join(__dirname, 'output-svtav1-bench.mp4');

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(` Input file not found: ${inputFile}`);
    console.log('Please place a video file named "input.mp4" in the example directory');
    return;
  }

  const cpuCount = os.cpus().length;
  console.log(`System has ${cpuCount} CPU cores available`);
  console.log(`Input: ${inputFile}`);

  // Common options for fair comparison
  const commonOptions = {
    format: 'mp4',
    pixFmt: 'yuv420p',
    threads: cpuCount,
    keyframeInterval: 240,
    // Use a smaller segment for benchmarking
    duration: 10, // Only encode 10 seconds
  };

  // Benchmark rav1e
  try {
    console.log('\nBenchmarking rav1e...');
    console.log(`Output: ${outputRav1e}`);
    
    const startTimeRav1e = Date.now();
    let lastFpsRav1e = 0;
    
    const rav1eResult = await muxy.convertVideo(
      inputFile,
      outputRav1e,
      {
        ...commonOptions,
        codec: 'librav1e',
        speed: 10, // Fastest setting
        qp: 80,    // Lower quality for speed
      },
      (progress) => {
        lastFpsRav1e = progress.fps;
        process.stdout.write(`\rEncoding: ${progress.percent.toFixed(1)}% complete (${progress.fps.toFixed(1)} fps) - ${progress.time}`);
      }
    );
    
    const durationRav1e = (Date.now() - startTimeRav1e) / 1000;
    console.log(`\nrav1e encoding completed in ${durationRav1e.toFixed(2)} seconds`);
    console.log(`Average FPS: ${lastFpsRav1e.toFixed(2)}`);
    
    const statsRav1e = fs.statSync(outputRav1e);
    const fileSizeRav1eMB = (statsRav1e.size / (1024 * 1024)).toFixed(2);
    console.log(`File size: ${fileSizeRav1eMB} MB`);
  } catch (error) {
    console.error(`\nError benchmarking rav1e: ${error.message}`);
  }

  // Benchmark SVT-AV1
  try {
    console.log('\nBenchmarking SVT-AV1...');
    console.log(`Output: ${outputSvtAv1}`);
    
    const startTimeSvtAv1 = Date.now();
    let lastFpsSvtAv1 = 0;
    
    const svtAv1Result = await muxy.convertVideo(
      inputFile,
      outputSvtAv1,
      {
        ...commonOptions,
        codec: 'libsvtav1',
        preset: 12, // Fastest setting
        crf: 30,    // Quality level
      },
      (progress) => {
        lastFpsSvtAv1 = progress.fps;
        process.stdout.write(`\rEncoding: ${progress.percent.toFixed(1)}% complete (${progress.fps.toFixed(1)} fps) - ${progress.time}`);
      }
    );
    
    const durationSvtAv1 = (Date.now() - startTimeSvtAv1) / 1000;
    console.log(`\nSVT-AV1 encoding completed in ${durationSvtAv1.toFixed(2)} seconds`);
    console.log(`Average FPS: ${lastFpsSvtAv1.toFixed(2)}`);
    
    const statsSvtAv1 = fs.statSync(outputSvtAv1);
    const fileSizeSvtAv1MB = (statsSvtAv1.size / (1024 * 1024)).toFixed(2);
    console.log(`File size: ${fileSizeSvtAv1MB} MB`);
  } catch (error) {
    console.error(`\nError benchmarking SVT-AV1: ${error.message}`);
  }
}

// Main function
async function main() {
  console.log('=== Muxy SVT-AV1 Encoding Example with Multi-threading ===');
  
  // Choose which method to run
  await encodeWithSvtAv1();
  // Uncomment to run the Promise-based example
  // await encodeWithSvtAv1Promise();
  // Uncomment to run the benchmark
  // await benchmarkAv1Encoders();
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
