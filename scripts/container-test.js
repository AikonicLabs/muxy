#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Promisify the exec function from child_process
const exec = promisify(execCallback);

// Ensure the assets directory exists
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Video codecs and formats to generate
const videoConfigs = [
  // Standard formats
  { name: 'h264-mp4', codec: 'libx264', format: 'mp4', pixFmt: 'yuv420p' },
  { name: 'h265-mp4', codec: 'libx265', format: 'mp4', pixFmt: 'yuv420p' },
  { name: 'vp9-webm', codec: 'libvpx-vp9', format: 'webm', pixFmt: 'yuv420p' },
  { name: 'vp8-webm', codec: 'libvpx', format: 'webm', pixFmt: 'yuv420p' },
  { name: 'av1-mp4', codec: 'libaom-av1', format: 'mp4', pixFmt: 'yuv420p', extraArgs: ['-crf', '30', '-strict', 'experimental'] },
  
  // Additional consumer formats
  { name: 'h264-mkv', codec: 'libx264', format: 'matroska', pixFmt: 'yuv420p' },
  { name: 'h265-mkv', codec: 'libx265', format: 'matroska', pixFmt: 'yuv420p' },
  { name: 'h264-ts', codec: 'libx264', format: 'mpegts', pixFmt: 'yuv420p' },
  { name: 'mpeg4-mp4', codec: 'mpeg4', format: 'mp4', pixFmt: 'yuv420p' },
  { name: 'mpeg2-mpg', codec: 'mpeg2video', format: 'mpeg', pixFmt: 'yuv420p' },
  { name: 'wmv-asf', codec: 'wmv2', format: 'asf', pixFmt: 'yuv420p' },
  { name: 'flv-flv', codec: 'flv', format: 'flv', pixFmt: 'yuv420p' },
  
  // Professional formats
  { name: 'theora-ogv', codec: 'libtheora', format: 'ogg', pixFmt: 'yuv420p' },
  { name: 'prores-mov', codec: 'prores_ks', format: 'mov', pixFmt: 'yuv422p10le', extraArgs: ['-profile:v', '3'] },
  { name: 'dnxhd-mov', codec: 'dnxhd', format: 'mov', pixFmt: 'yuv422p', extraArgs: ['-b:v', '36M'] },
  { name: 'mjpeg-avi', codec: 'mjpeg', format: 'avi', pixFmt: 'yuvj420p' }
];

// Image formats to generate
const imageFormats = [
  // Standard formats
  'jpg',
  'png',
  'webp',
  'gif',
  'tiff',
  'bmp',
  
  // Additional formats
  'avif',       // AV1 Image File Format
  'heif',       // High Efficiency Image Format (HEIC container)
  'jp2',        // JPEG 2000
  'ppm',        // Portable Pixmap
  'pgm',        // Portable Graymap
  'tga',        // Truevision TGA
  'dds',        // DirectDraw Surface
  'ico',        // Windows Icon
  
  // Raw image formats
  'raw',        // Raw image data
  'yuv',        // YUV raw image
  'y4m',        // YUV4MPEG2 raw video
  'dpx',        // Digital Picture Exchange (raw film format)
  'exr'         // OpenEXR (HDR raw format)
];

// Create a test video with the specified codec and format
async function createTestVideo(config) {
  const { name, codec, format, pixFmt, extraArgs = [] } = config;
  const outputPath = path.join(assetsDir, `test-${name}.${format}`);
  
  console.log(`Creating test video: ${name} (${codec})`);
  
  // Base arguments
  const args = [
    '-y',
    '-f', 'lavfi',
    '-i', 'testsrc=duration=3:size=640x360:rate=30',
    '-c:v', codec,
    '-pix_fmt', pixFmt
  ];
  
  // Add any extra codec-specific arguments
  args.push(...extraArgs);
  
  // Add output path
  args.push(outputPath);
  
  try {
    // Use spawn directly for better control and output
    const ffmpeg = spawn('ffmpeg', args);
    
    ffmpeg.stderr.on('data', (data) => {
      // ffmpeg outputs progress info to stderr, so we don't treat this as an error
      process.stdout.write('.');
    });
    
    await new Promise((resolve, reject) => {
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log(` ✅ Created ${outputPath}`);
          resolve();
        } else {
          console.error(`\n❌ Failed to create ${name} video. Exit code: ${code}`);
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });
      
      ffmpeg.on('error', (err) => {
        console.error(`\n❌ Error creating ${name} video: ${err.message}`);
        reject(err);
      });
    });
    
    return outputPath;
  } catch (error) {
    console.error(`Error creating ${name} video:`, error.message);
    return null;
  }
}

// Create a test image with the specified format
async function createTestImage(format) {
  const outputPath = path.join(assetsDir, `test-image.${format}`);
  
  console.log(`Creating test image: ${format}`);
  
  const args = [
    '-y',
    '-f', 'lavfi',
    '-i', 'testsrc=duration=1:size=640x360:rate=1',
    '-vframes', '1'
  ];
  
  // Add format-specific options
  switch (format) {
    case 'jpg':
      args.push('-q:v', '2');
      break;
    case 'png':
      args.push('-compression_level', '3');
      break;
    case 'webp':
      args.push('-quality', '90');
      break;
    case 'gif':
      // No special options
      break;
    case 'tiff':
      args.push('-compression_algo', 'lzw');
      break;
    case 'bmp':
      // No special options
      break;
    case 'avif':
      args.push('-c:v', 'libaom-av1', '-crf', '30', '-strict', 'experimental');
      break;
    case 'heif':
      args.push('-c:v', 'libx265');
      break;
    case 'jp2':
      args.push('-c:v', 'jpeg2000', '-q:v', '7');
      break;
    case 'tga':
      // No special options
      break;
    case 'dds':
      // DDS requires special handling
      args.push('-pix_fmt', 'rgba');
      break;
    case 'ico':
      // ICO requires special size
      args.splice(2, 2, '-i', 'testsrc=duration=1:size=256x256:rate=1');
      break;
    case 'raw':
      // Raw image data
      args.push('-pix_fmt', 'rgb24');
      break;
    case 'yuv':
      // YUV raw image
      args.push('-pix_fmt', 'yuv420p');
      break;
    case 'y4m':
      // Y4M format
      args.splice(args.length - 1, 1); // Remove last argument (output path)
      args.push('-f', 'yuv4mpegpipe', outputPath);
      break;
    case 'dpx':
      // DPX format
      args.push('-pix_fmt', 'rgb24');
      break;
    case 'exr':
      // OpenEXR format
      args.push('-pix_fmt', 'rgb48le');
      break;
  }
  
  // Add output path
  args.push(outputPath);
  
  try {
    // Use spawn directly for better control and output
    const ffmpeg = spawn('ffmpeg', args);
    
    ffmpeg.stderr.on('data', (data) => {
      // ffmpeg outputs progress info to stderr, so we don't treat this as an error
      process.stdout.write('.');
    });
    
    await new Promise((resolve, reject) => {
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log(` ✅ Created ${outputPath}`);
          resolve();
        } else {
          console.error(`\n❌ Failed to create ${format} image. Exit code: ${code}`);
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });
      
      ffmpeg.on('error', (err) => {
        console.error(`\n❌ Error creating ${format} image: ${err.message}`);
        reject(err);
      });
    });
    
    return outputPath;
  } catch (error) {
    console.error(`Error creating ${format} image:`, error.message);
    return null;
  }
}

// Create animated GIF and WebP
async function createAnimatedImages() {
  console.log('Creating animated images');
  
  const formats = [
    { name: 'animated-gif', format: 'gif' },
    { name: 'animated-webp', format: 'webp', extraArgs: ['-loop', '0', '-compression_level', '6'] }
  ];
  
  for (const { name, format, extraArgs = [] } of formats) {
    const outputPath = path.join(assetsDir, `${name}.${format}`);
    
    console.log(`Creating ${name}`);
    
    // Base arguments for animated image
    const args = [
      '-y',
      '-f', 'lavfi',
      '-i', 'testsrc=duration=3:size=320x240:rate=10',
      '-vf', 'fps=10'
    ];
    
    // Add format-specific arguments
    args.push(...extraArgs);
    
    // Add output path
    args.push(outputPath);
    
    try {
      const ffmpeg = spawn('ffmpeg', args);
      
      ffmpeg.stderr.on('data', () => {
        process.stdout.write('.');
      });
      
      await new Promise((resolve, reject) => {
        ffmpeg.on('close', (code) => {
          if (code === 0) {
            console.log(` ✅ Created ${outputPath}`);
            resolve();
          } else {
            console.error(`\n❌ Failed to create ${name}. Exit code: ${code}`);
            reject(new Error(`ffmpeg exited with code ${code}`));
          }
        });
        
        ffmpeg.on('error', (err) => {
          console.error(`\n❌ Error creating ${name}: ${err.message}`);
          reject(err);
        });
      });
    } catch (error) {
      console.error(`Error creating ${name}:`, error.message);
    }
  }
}

// Create a test HLS stream
async function createTestHLS() {
  const hlsDir = path.join(assetsDir, 'hls');
  if (!fs.existsSync(hlsDir)) {
    fs.mkdirSync(hlsDir, { recursive: true });
  }
  
  const outputPath = path.join(hlsDir, 'master.m3u8');
  
  console.log('Creating test HLS stream');
  
  const args = [
    '-y',
    '-f', 'lavfi',
    '-i', 'testsrc=duration=5:size=640x360:rate=30',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'main',
    '-level', '3.1',
    '-start_number', '0',
    '-hls_time', '2',
    '-hls_list_size', '0',
    '-f', 'hls'
  ];
  
  // Add output path
  args.push(outputPath);
  
  try {
    // Use spawn directly for better control and output
    const ffmpeg = spawn('ffmpeg', args);
    
    ffmpeg.stderr.on('data', (data) => {
      // ffmpeg outputs progress info to stderr, so we don't treat this as an error
      process.stdout.write('.');
    });
    
    await new Promise((resolve, reject) => {
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log(` ✅ Created HLS stream at ${hlsDir}`);
          resolve();
        } else {
          console.error(`\n❌ Failed to create HLS stream. Exit code: ${code}`);
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });
      
      ffmpeg.on('error', (err) => {
        console.error(`\n❌ Error creating HLS stream: ${err.message}`);
        reject(err);
      });
    });
    
    return outputPath;
  } catch (error) {
    console.error('Error creating HLS stream:', error.message);
    return null;
  }
}

// Create DASH stream
async function createTestDASH() {
  const dashDir = path.join(assetsDir, 'dash');
  if (!fs.existsSync(dashDir)) {
    fs.mkdirSync(dashDir, { recursive: true });
  }
  
  const outputPath = path.join(dashDir, 'manifest.mpd');
  
  console.log('Creating test DASH stream');
  
  const args = [
    '-y',
    '-f', 'lavfi',
    '-i', 'testsrc=duration=5:size=640x360:rate=30',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-profile:v', 'main',
    '-level', '3.1',
    '-use_timeline', '1',
    '-use_template', '1',
    '-window_size', '5',
    '-adaptation_sets', 'id=0,streams=v',
    '-f', 'dash'
  ];
  
  // Add output path
  args.push(outputPath);
  
  try {
    // Use spawn directly for better control and output
    const ffmpeg = spawn('ffmpeg', args);
    
    ffmpeg.stderr.on('data', (data) => {
      // ffmpeg outputs progress info to stderr, so we don't treat this as an error
      process.stdout.write('.');
    });
    
    await new Promise((resolve, reject) => {
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          console.log(` ✅ Created DASH stream at ${dashDir}`);
          resolve();
        } else {
          console.error(`\n❌ Failed to create DASH stream. Exit code: ${code}`);
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });
      
      ffmpeg.on('error', (err) => {
        console.error(`\n❌ Error creating DASH stream: ${err.message}`);
        reject(err);
      });
    });
    
    return outputPath;
  } catch (error) {
    console.error('Error creating DASH stream:', error.message);
    return null;
  }
}

// Check if ffmpeg is installed
async function checkFfmpeg() {
  try {
    await exec('ffmpeg -version');
    return true;
  } catch (error) {
    return false;
  }
}

// Main function to run all tests
async function main() {
  console.log('🎬 Creating test media files for Muxy...');
  console.log(`Output directory: ${assetsDir}`);
  
  try {
    // Check if ffmpeg is installed
    const ffmpegInstalled = await checkFfmpeg();
    if (!ffmpegInstalled) {
      throw new Error('ffmpeg is not installed or not in PATH');
    }
    console.log('✅ ffmpeg is installed and working\n');
    
    // Create test videos
    console.log('📼 Generating test videos with various codecs:');
    for (const config of videoConfigs) {
      try {
        await createTestVideo(config);
      } catch (error) {
        console.error(`Error with ${config.name}:`, error.message);
        // Continue with other formats even if one fails
      }
    }
    
    // Create test images
    console.log('\n🖼️ Generating test images with various formats:');
    for (const format of imageFormats) {
      try {
        await createTestImage(format);
      } catch (error) {
        console.error(`Error with ${format}:`, error.message);
        // Continue with other formats even if one fails
      }
    }
    
    // Create animated images
    console.log('\n🎞️ Generating animated images:');
    await createAnimatedImages();
    
    // Create test HLS stream
    console.log('\n🌊 Generating test HLS stream:');
    await createTestHLS();
    
    // Create test DASH stream
    console.log('\n📱 Generating test DASH stream:');
    await createTestDASH();
    
    console.log('\n✅ All test media files created successfully!');
    console.log(`You can find them in: ${assetsDir}`);
    console.log('You can now use these files with the Muxy library examples.');
    
  } catch (error) {
    console.error('\n❌ Error creating test media files:', error.message);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
