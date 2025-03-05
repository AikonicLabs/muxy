#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';

// Check if SVT-AV1 is available via FFmpeg
async function checkSvtAv1Availability() {
  return new Promise((resolve) => {
    console.log('Checking for SVT-AV1 support in FFmpeg...');
    
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
      
      // Check if libsvtav1 is in the list of encoders
      if (output.includes('libsvtav1')) {
        console.log('✅ SVT-AV1 encoder (libsvtav1) is available in FFmpeg');
        resolve(true);
      } else {
        console.log('❌ SVT-AV1 encoder (libsvtav1) is not available in FFmpeg');
        console.log('');
        console.log('To use SVT-AV1 with FFmpeg, you need to:');
        console.log('1. Install SVT-AV1');
        console.log('2. Ensure FFmpeg is compiled with libsvtav1 support');
        console.log('');
        console.log('Installation instructions:');
        console.log('- From source: https://gitlab.com/AOMediaCodec/SVT-AV1');
        resolve(false);
      }
    });
  });
}

// Check if standalone SVT-AV1 is available
async function checkStandaloneSvtAv1() {
  return new Promise((resolve) => {
    console.log('Checking for standalone SVT-AV1 installation...');
    
    // Check if SvtAv1EncApp exists in common locations
    const possiblePaths = [
      'SvtAv1EncApp', // In PATH
      '/usr/local/bin/SvtAv1EncApp',
      '/usr/bin/SvtAv1EncApp'
    ];
    
    // First check if the binary exists in any of the locations
    for (const path of possiblePaths) {
      if (path !== 'SvtAv1EncApp' && existsSync(path)) {
        console.log(`✅ Standalone SVT-AV1 is installed at ${path}`);
        resolve(true);
        return;
      }
    }
    
    // If not found by direct path check, try running the command
    const svtav1 = spawn('SvtAv1EncApp', ['--help']);
    let output = '';
    
    svtav1.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    svtav1.on('error', () => {
      console.log('❌ Standalone SVT-AV1 is not installed');
      resolve(false);
    });
    
    svtav1.on('close', (code) => {
      if (code === 0 && output.includes('SVT-AV1')) {
        console.log('✅ Standalone SVT-AV1 is installed');
        resolve(true);
      } else {
        console.log('❌ Standalone SVT-AV1 is not installed');
        resolve(false);
      }
    });
  });
}

// Main function
async function main() {
  console.log('=== SVT-AV1 Encoder Availability Check ===');
  
  const ffmpegHasSvtAv1 = await checkSvtAv1Availability();
  const standaloneSvtAv1Available = await checkStandaloneSvtAv1();
  
  console.log('');
  console.log('=== Summary ===');
  
  if (ffmpegHasSvtAv1) {
    console.log('✅ FFmpeg with libsvtav1 support is available');
    console.log('   You can use the libsvtav1 codec in Muxy');
  } else {
    console.log('❌ FFmpeg with libsvtav1 support is not available');
    console.log('   You cannot use the libsvtav1 codec in Muxy');
  }
  
  if (standaloneSvtAv1Available) {
    console.log('✅ Standalone SVT-AV1 is available');
    console.log('   You can use SVT-AV1 for direct encoding');
  } else {
    console.log('❌ Standalone SVT-AV1 is not available');
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
