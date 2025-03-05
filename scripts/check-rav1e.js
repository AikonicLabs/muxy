#!/usr/bin/env node

import { spawn } from 'child_process';

// Check if rav1e is available via FFmpeg
async function checkRav1eAvailability() {
  return new Promise((resolve) => {
    console.log('Checking for rav1e support in FFmpeg...');
    
    // Run ffmpeg to list encoders
    const ffmpeg = spawn('ffmpeg', ['-encoders']);
    let output = '';
    
    ffmpeg.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ffmpeg.stderr.on('data', (data) => {
      // FFmpeg may output to stderr
      output += data.toString();
    });
    
    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        console.error('❌ Error running FFmpeg. Is it installed?');
        resolve(false);
        return;
      }
      
      // Check if librav1e is in the list of encoders
      if (output.includes('librav1e')) {
        console.log('✅ rav1e encoder (librav1e) is available in FFmpeg');
        resolve(true);
      } else {
        console.log('❌ rav1e encoder (librav1e) is not available in FFmpeg');
        console.log('');
        console.log('To use rav1e with FFmpeg, you need to:');
        console.log('1. Install rav1e');
        console.log('2. Ensure FFmpeg is compiled with librav1e support');
        console.log('');
        console.log('Installation instructions:');
        console.log('- macOS: brew install rav1e && brew install ffmpeg --with-librav1e');
        console.log('- From source: https://github.com/xiph/rav1e#installing');
        resolve(false);
      }
    });
  });
}

// Check if standalone rav1e is available
async function checkStandaloneRav1e() {
  return new Promise((resolve) => {
    console.log('Checking for standalone rav1e installation...');
    
    // Run rav1e --version
    const rav1e = spawn('rav1e', ['--version']);
    let output = '';
    
    rav1e.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    rav1e.on('error', () => {
      console.log('❌ Standalone rav1e is not installed');
      resolve(false);
    });
    
    rav1e.on('close', (code) => {
      if (code === 0 && output.includes('rav1e')) {
        console.log(`✅ Standalone rav1e is installed: ${output.trim()}`);
        resolve(true);
      } else {
        console.log('❌ Standalone rav1e is not installed');
        resolve(false);
      }
    });
  });
}

// Main function
async function main() {
  console.log('=== rav1e Availability Check ===');
  
  const ffmpegRav1e = await checkRav1eAvailability();
  const standaloneRav1e = await checkStandaloneRav1e();
  
  console.log('');
  console.log('=== Summary ===');
  if (ffmpegRav1e) {
    console.log('✅ FFmpeg with librav1e support is available');
    console.log('   You can use the librav1e codec in Muxy');
  } else {
    console.log('❌ FFmpeg with librav1e support is not available');
    console.log('   Muxy will fall back to libaom-av1 for AV1 encoding');
  }
  
  if (standaloneRav1e) {
    console.log('✅ Standalone rav1e is available');
    console.log('   You can use it directly or via FFmpeg');
  } else {
    console.log('❌ Standalone rav1e is not available');
  }
  
  console.log('');
  if (!ffmpegRav1e && !standaloneRav1e) {
    console.log('For more information on rav1e, visit: https://github.com/xiph/rav1e');
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
