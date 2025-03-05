import path from 'path';
import fs from 'fs';
import os from 'os';
import muxy from '../src/index';

/**
 * AV1 Encoding Benchmark
 * 
 * This script benchmarks AV1 encoding using rav1e with different threading configurations.
 * It compares single-threaded vs multi-threaded performance.
 */

// Benchmark configuration
const INPUT_FILE = path.join(__dirname, 'input.mp4');
const OUTPUT_DIR = path.join(__dirname, 'benchmark');
const DURATION_SECONDS = 10; // Duration to encode for benchmark

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Check if input file exists
if (!fs.existsSync(INPUT_FILE)) {
  console.error(`❌ Input file not found: ${INPUT_FILE}`);
  console.log('Please place a video file named "input.mp4" in the example directory');
  process.exit(1);
}

// Get system information
const cpuCount = os.cpus().length;
console.log(`=== System Information ===`);
console.log(`CPU Cores: ${cpuCount}`);
console.log(`Architecture: ${os.arch()}`);
console.log(`Platform: ${os.platform()}`);
console.log(`Node.js: ${process.version}`);
console.log(`Total Memory: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`);
console.log(`Free Memory: ${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB`);
console.log('');

// Benchmark single-threaded encoding
async function benchmarkSingleThreaded() {
  console.log('=== Single-Threaded AV1 Encoding Benchmark ===');
  
  const outputFile = path.join(OUTPUT_DIR, 'single-threaded.mp4');
  console.log(`Output: ${outputFile}`);
  
  const startTime = Date.now();
  
  try {
    // Create a video converter with single-threaded configuration
    const converter = muxy.createVideoConverter(INPUT_FILE, outputFile, {
      codec: 'librav1e',
      format: 'mp4',
      pixFmt: 'yuv420p',
      speed: 6,
      tileColumns: 1,
      tileRows: 1,
      threads: 1, // Force single thread
      bitrate: '2M',
      keyframeInterval: 240,
      // Limit duration for benchmark
      extraOptions: ['-t', DURATION_SECONDS.toString()]
    });
    
    // Track progress
    let lastProgress = 0;
    converter.on('progress', (progress) => {
      const percent = Math.floor(progress.percent);
      if (percent > lastProgress && percent % 10 === 0) {
        lastProgress = percent;
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        console.log(`Progress: ${percent}% (${progress.fps} fps) - Elapsed: ${elapsedSeconds.toFixed(1)}s`);
      }
    });
    
    // Handle completion
    await converter.start();
    
    const endTime = Date.now();
    const elapsedSeconds = (endTime - startTime) / 1000;
    
    console.log(`✅ Single-threaded encoding complete in ${elapsedSeconds.toFixed(2)} seconds`);
    
    // Get file size
    const stats = fs.statSync(outputFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`File size: ${fileSizeMB} MB`);
    
    return { time: elapsedSeconds, fileSize: parseFloat(fileSizeMB) };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { time: 0, fileSize: 0 };
  }
}

// Benchmark multi-threaded encoding
async function benchmarkMultiThreaded() {
  console.log('\n=== Multi-Threaded AV1 Encoding Benchmark ===');
  
  const outputFile = path.join(OUTPUT_DIR, 'multi-threaded.mp4');
  console.log(`Output: ${outputFile}`);
  console.log(`Using ${cpuCount} CPU cores`);
  
  const startTime = Date.now();
  
  try {
    // Create a video converter with multi-threaded configuration
    const converter = muxy.createVideoConverter(INPUT_FILE, outputFile, {
      codec: 'librav1e',
      format: 'mp4',
      pixFmt: 'yuv420p',
      speed: 6,
      tileColumns: 2,
      tileRows: 2,
      threads: cpuCount, // Use all CPU cores
      bitrate: '2M',
      keyframeInterval: 240,
      // Limit duration for benchmark
      extraOptions: ['-t', DURATION_SECONDS.toString()]
    });
    
    // Track progress
    let lastProgress = 0;
    converter.on('progress', (progress) => {
      const percent = Math.floor(progress.percent);
      if (percent > lastProgress && percent % 10 === 0) {
        lastProgress = percent;
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        console.log(`Progress: ${percent}% (${progress.fps} fps) - Elapsed: ${elapsedSeconds.toFixed(1)}s`);
      }
    });
    
    // Handle completion
    await converter.start();
    
    const endTime = Date.now();
    const elapsedSeconds = (endTime - startTime) / 1000;
    
    console.log(`✅ Multi-threaded encoding complete in ${elapsedSeconds.toFixed(2)} seconds`);
    
    // Get file size
    const stats = fs.statSync(outputFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`File size: ${fileSizeMB} MB`);
    
    return { time: elapsedSeconds, fileSize: parseFloat(fileSizeMB) };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { time: 0, fileSize: 0 };
  }
}

// Run benchmarks and compare results
async function runBenchmarks() {
  console.log('🔍 Starting AV1 Encoding Benchmarks');
  console.log(`Input: ${INPUT_FILE}`);
  console.log(`Benchmark duration: ${DURATION_SECONDS} seconds of video`);
  console.log('');
  
  // Run single-threaded benchmark
  const singleThreadedResult = await benchmarkSingleThreaded();
  
  // Run multi-threaded benchmark
  const multiThreadedResult = await benchmarkMultiThreaded();
  
  // Compare results
  if (singleThreadedResult.time > 0 && multiThreadedResult.time > 0) {
    console.log('\n=== Benchmark Results ===');
    console.log(`Single-threaded encoding time: ${singleThreadedResult.time.toFixed(2)} seconds`);
    console.log(`Multi-threaded encoding time: ${multiThreadedResult.time.toFixed(2)} seconds`);
    
    const speedup = singleThreadedResult.time / multiThreadedResult.time;
    console.log(`Speedup factor: ${speedup.toFixed(2)}x`);
    console.log(`Efficiency: ${((speedup / cpuCount) * 100).toFixed(1)}% of perfect linear scaling`);
    
    console.log('\nFile size comparison:');
    console.log(`Single-threaded: ${singleThreadedResult.fileSize} MB`);
    console.log(`Multi-threaded: ${multiThreadedResult.fileSize} MB`);
    
    const sizeDiff = ((multiThreadedResult.fileSize - singleThreadedResult.fileSize) / singleThreadedResult.fileSize) * 100;
    console.log(`Size difference: ${sizeDiff.toFixed(2)}%`);
  }
}

// Run the benchmarks
runBenchmarks().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
