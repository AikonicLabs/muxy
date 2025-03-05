#!/usr/bin/env node

/**
 * Script to generate a test video file for benchmarking
 * This creates a 10-second test pattern video that can be used for encoding tests
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for better output formatting
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'example');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'input.mp4');
const DURATION = 10; // seconds
const RESOLUTION = '1920x1080';
const FRAMERATE = 30;

console.log(`${colors.bold}${colors.blue}===== Generating Test Video =====${colors.reset}\n`);

// Check if FFmpeg is installed
try {
  console.log(`${colors.cyan}Checking FFmpeg installation...${colors.reset}`);
  const ffmpegVersion = execSync('ffmpeg -version').toString().split('\n')[0];
  console.log(`${colors.green}✓ FFmpeg installed: ${ffmpegVersion}${colors.reset}\n`);
} catch (error) {
  console.error(`${colors.red}✗ FFmpeg not found. Please install FFmpeg.${colors.reset}`);
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  console.log(`${colors.cyan}Creating output directory: ${OUTPUT_DIR}${colors.reset}`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Generate test video
console.log(`${colors.cyan}Generating ${DURATION} second test video at ${RESOLUTION}...${colors.reset}`);

try {
  // Create a test pattern video with various test elements
  const command = `ffmpeg -y -f lavfi -i testsrc=duration=${DURATION}:size=${RESOLUTION}:rate=${FRAMERATE} -f lavfi -i sine=frequency=440:duration=${DURATION} -c:v libx264 -preset ultrafast -crf 22 -c:a aac -b:a 128k "${OUTPUT_FILE}"`;
  
  console.log(`${colors.yellow}Running command: ${command}${colors.reset}\n`);
  execSync(command, { stdio: 'inherit' });
  
  // Verify the file was created
  if (fs.existsSync(OUTPUT_FILE)) {
    const stats = fs.statSync(OUTPUT_FILE);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`\n${colors.green}✓ Test video generated successfully: ${OUTPUT_FILE}${colors.reset}`);
    console.log(`${colors.green}✓ File size: ${fileSizeMB} MB${colors.reset}`);
    console.log(`${colors.green}✓ Duration: ${DURATION} seconds${colors.reset}`);
    console.log(`${colors.green}✓ Resolution: ${RESOLUTION}${colors.reset}`);
    console.log(`${colors.green}✓ Framerate: ${FRAMERATE} fps${colors.reset}\n`);
    
    console.log(`${colors.bold}${colors.blue}You can now run the benchmark with:${colors.reset}`);
    console.log(`${colors.cyan}pnpm benchmark:av1${colors.reset}\n`);
  } else {
    console.error(`${colors.red}✗ Failed to generate test video. File not found.${colors.reset}`);
    process.exit(1);
  }
} catch (error) {
  console.error(`${colors.red}✗ Error generating test video: ${error.message}${colors.reset}`);
  process.exit(1);
}
