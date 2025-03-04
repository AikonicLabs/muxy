#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing ffmpeg installation...');

const ffmpeg = spawn('ffmpeg', ['-version']);

ffmpeg.stdout.on('data', (data) => {
  console.log(`ffmpeg version information:`);
  console.log(data.toString());
});

ffmpeg.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

ffmpeg.on('close', (code) => {
  if (code === 0) {
    console.log('✅ ffmpeg is correctly installed and working!');
  } else {
    console.error(`❌ ffmpeg process exited with code ${code}`);
  }
});
