#!/usr/bin/env node

/**
 * Script to check if FFmpeg is properly installed with AV1 encoding support
 * and verify multi-threading capabilities.
 */

const { execSync } = require('child_process');
const os = require('os');

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

console.log(`${colors.bold}${colors.blue}===== FFmpeg and AV1 Encoder Compatibility Check =====${colors.reset}\n`);

// Check if FFmpeg is installed
try {
  console.log(`${colors.cyan}Checking FFmpeg installation...${colors.reset}`);
  const ffmpegVersion = execSync('ffmpeg -version').toString().split('\n')[0];
  console.log(`${colors.green}✓ FFmpeg installed: ${ffmpegVersion}${colors.reset}\n`);
} catch (error) {
  console.error(`${colors.red}✗ FFmpeg not found. Please install FFmpeg.${colors.reset}`);
  process.exit(1);
}

// Check if rav1e is installed
let rav1eInstalled = false;
try {
  console.log(`${colors.cyan}Checking rav1e installation...${colors.reset}`);
  const rav1eVersion = execSync('rav1e --version').toString().trim();
  console.log(`${colors.green}✓ rav1e installed: ${rav1eVersion}${colors.reset}\n`);
  rav1eInstalled = true;
} catch (error) {
  console.log(`${colors.yellow}⚠ rav1e CLI not found. This is not critical if FFmpeg has other AV1 encoders.${colors.reset}\n`);
}

// Check available encoders
console.log(`${colors.cyan}Checking available AV1 encoders in FFmpeg...${colors.reset}`);
const encoders = execSync('ffmpeg -encoders').toString();
const av1Encoders = encoders.split('\n').filter(line => line.includes('AV1'));

if (av1Encoders.length > 0) {
  console.log(`${colors.green}Available AV1 encoders:${colors.reset}`);
  av1Encoders.forEach(encoder => {
    console.log(`  ${encoder.trim()}`);
  });
  console.log('');
} else {
  console.log(`${colors.red}✗ No AV1 encoders found in FFmpeg${colors.reset}\n`);
}

// Check for specific AV1 encoders
const hasLibRav1eEncoder = encoders.includes('librav1e');
const hasLibAomAv1Encoder = encoders.includes('libaom-av1');
const hasSvtAv1Encoder = encoders.includes('libsvtav1');

if (hasLibRav1eEncoder) {
  console.log(`${colors.green}✓ librav1e encoder is available${colors.reset}\n`);
} else {
  console.log(`${colors.yellow}⚠ librav1e encoder is NOT available in FFmpeg${colors.reset}`);
  
  if (hasLibAomAv1Encoder) {
    console.log(`${colors.green}✓ libaom-av1 encoder is available (alternative to rav1e)${colors.reset}\n`);
  } else if (hasSvtAv1Encoder) {
    console.log(`${colors.green}✓ libsvtav1 encoder is available (alternative to rav1e)${colors.reset}\n`);
  } else {
    console.log(`${colors.red}✗ No AV1 encoders are available in FFmpeg${colors.reset}\n`);
  }
}

// Check system resources for multi-threading
console.log(`${colors.cyan}Checking system resources for multi-threading...${colors.reset}`);
const cpuCount = os.cpus().length;
console.log(`${colors.green}✓ Available CPU cores: ${cpuCount}${colors.reset}`);
console.log(`${colors.green}✓ Total memory: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB${colors.reset}\n`);

// Check if FFmpeg supports threading options
console.log(`${colors.cyan}Testing FFmpeg threading options...${colors.reset}`);
try {
  // Create a simple test command that uses threading options
  const testCmd = 'ffmpeg -f lavfi -i testsrc=duration=1:size=640x480:rate=30 -threads 2 -f null -';
  execSync(testCmd, { stdio: 'ignore' });
  console.log(`${colors.green}✓ FFmpeg supports basic threading options${colors.reset}\n`);
} catch (error) {
  console.log(`${colors.red}✗ FFmpeg does not support basic threading options${colors.reset}`);
  console.log(`${colors.yellow}Error: ${error.message}${colors.reset}\n`);
}

// Final assessment
console.log(`${colors.bold}${colors.blue}===== Final Assessment =====${colors.reset}`);
if (hasLibRav1eEncoder) {
  console.log(`${colors.bold}${colors.green}✓ Your system is properly configured for AV1 encoding with rav1e${colors.reset}`);
  console.log(`${colors.green}✓ Multi-threading is available with ${cpuCount} CPU cores${colors.reset}`);
  console.log(`${colors.green}✓ You can now use the Muxy library with AV1 encoding support via rav1e${colors.reset}\n`);
} else if (hasLibAomAv1Encoder || hasSvtAv1Encoder) {
  console.log(`${colors.bold}${colors.yellow}⚠ Your system does not have rav1e support, but alternative AV1 encoders are available${colors.reset}`);
  
  if (hasLibAomAv1Encoder) {
    console.log(`${colors.green}✓ You can use libaom-av1 encoder instead of rav1e${colors.reset}`);
    console.log(`${colors.green}✓ Multi-threading is available with ${cpuCount} CPU cores${colors.reset}`);
    console.log(`${colors.yellow}⚠ Note: libaom-av1 is typically slower than rav1e but may provide better quality${colors.reset}\n`);
  }
  
  if (hasSvtAv1Encoder) {
    console.log(`${colors.green}✓ You can use libsvtav1 encoder instead of rav1e${colors.reset}`);
    console.log(`${colors.green}✓ Multi-threading is available with ${cpuCount} CPU cores${colors.reset}`);
    console.log(`${colors.yellow}⚠ Note: SVT-AV1 is a good alternative with excellent multi-threading support${colors.reset}\n`);
  }
} else {
  console.log(`${colors.bold}${colors.red}✗ Your system is NOT properly configured for AV1 encoding${colors.reset}`);
  console.log(`${colors.yellow}Please install FFmpeg with AV1 encoding support${colors.reset}\n`);
}

// Additional information
console.log(`${colors.bold}${colors.blue}===== Usage Example =====${colors.reset}`);

if (hasLibRav1eEncoder) {
  console.log(`
To encode a video with AV1 using rav1e in Muxy:

const muxy = require('@aikonlabs/muxy');

const converter = muxy.createVideoConverter('input.mp4', 'output.mp4', {
  codec: 'librav1e',
  format: 'mp4',
  pixFmt: 'yuv420p',
  speed: 6,
  tileColumns: 2,
  tileRows: 2,
  threads: ${cpuCount}, // Use all available CPU cores
  bitrate: '2M',
  keyframeInterval: 240
});

converter.on('progress', (progress) => {
  console.log(\`Progress: \${progress.percent}% (FPS: \${progress.fps})\`);
});

converter.start().then(() => {
  console.log('Conversion complete!');
}).catch((error) => {
  console.error('Conversion failed:', error);
});
`);
} else if (hasLibAomAv1Encoder) {
  console.log(`
To encode a video with AV1 using libaom-av1 in Muxy:

const muxy = require('@aikonlabs/muxy');

const converter = muxy.createVideoConverter('input.mp4', 'output.mp4', {
  codec: 'libaom-av1',
  format: 'mp4',
  pixFmt: 'yuv420p',
  // libaom-av1 specific options
  threads: ${cpuCount}, // Use all available CPU cores
  speed: 6, // Called cpu-used in libaom (0-8, higher is faster)
  tileColumns: 1,
  tileRows: 1,
  bitrate: '2M',
  keyframeInterval: 240
});

converter.on('progress', (progress) => {
  console.log(\`Progress: \${progress.percent}% (FPS: \${progress.fps})\`);
});

converter.start().then(() => {
  console.log('Conversion complete!');
}).catch((error) => {
  console.error('Conversion failed:', error);
});
`);
} else if (hasSvtAv1Encoder) {
  console.log(`
To encode a video with AV1 using SVT-AV1 in Muxy:

const muxy = require('@aikonlabs/muxy');

const converter = muxy.createVideoConverter('input.mp4', 'output.mp4', {
  codec: 'libsvtav1',
  format: 'mp4',
  pixFmt: 'yuv420p',
  // SVT-AV1 specific options
  threads: ${cpuCount}, // Use all available CPU cores
  preset: 6, // 0-13, higher is faster
  bitrate: '2M',
  keyframeInterval: 240
});

converter.on('progress', (progress) => {
  console.log(\`Progress: \${progress.percent}% (FPS: \${progress.fps})\`);
});

converter.start().then(() => {
  console.log('Conversion complete!');
}).catch((error) => {
  console.error('Conversion failed:', error);
});
`);
}

console.log(`${colors.bold}${colors.blue}===== End of Report =====${colors.reset}`);
