import muxy from '../src';
import path from 'path';

// Example input and output files
const inputVideo = path.join(__dirname, 'input.mp4');
const outputVideo = path.join(__dirname, 'output.mp4');
const outputImage = path.join(__dirname, 'output.jpg');
const hlsOutputDir = path.join(__dirname, 'hls');

console.log('Muxy Media Conversion Examples');
console.log('==============================');

// Example 1: Promise-based video conversion
console.log('\nExample 1: Promise-based video conversion');
console.log('----------------------------------------');

muxy.convertVideo(inputVideo, outputVideo, {
  codec: 'libx264',
  preset: 'fast',
  width: 1280,
  height: 720,
  bitrate: '1M'
})
  .then(result => {
    console.log('Video conversion completed successfully!');
    console.log(`Conversion took ${result.duration} seconds`);
  })
  .catch(error => {
    console.error('Video conversion failed:', error.message);
  });

// Example 2: Event-based video conversion
console.log('\nExample 2: Event-based video conversion');
console.log('------------------------------------');

const videoConverter = muxy.createVideoConverter(inputVideo, outputVideo, {
  codec: 'libx264',
  preset: 'fast',
  width: 1280,
  height: 720,
  bitrate: '1M'
});

videoConverter.on('progress', (progress) => {
  console.log(`Progress: ${progress.percent}% (Frame: ${progress.frame}, FPS: ${progress.fps})`);
});

videoConverter.on('error', (error) => {
  console.error('Video conversion failed:', error.message);
});

videoConverter.on('end', (result) => {
  console.log('Video conversion completed successfully!');
  console.log(`Conversion took ${result.duration} seconds`);
});

// Start the conversion
videoConverter.start()
  .then(result => {
    console.log('Video conversion promise resolved!');
  })
  .catch(error => {
    // Error is already handled by the 'error' event
  });

// Example 3: Promise-based image conversion
console.log('\nExample 3: Promise-based image conversion');
console.log('----------------------------------------');

muxy.convertImage(inputVideo, outputImage, {
  quality: 90
})
  .then(result => {
    console.log('Image conversion completed successfully!');
    console.log(`Conversion took ${result.duration} seconds`);
  })
  .catch(error => {
    console.error('Image conversion failed:', error.message);
  });

// Example 4: Event-based image conversion
console.log('\nExample 4: Event-based image conversion');
console.log('------------------------------------');

const imageConverter = muxy.createImageConverter(inputVideo, outputImage, {
  quality: 90
});

imageConverter.on('progress', (progress) => {
  console.log(`Progress: ${progress.percent}% (Frame: ${progress.frame}, FPS: ${progress.fps})`);
});

imageConverter.on('error', (error) => {
  console.error('Image conversion failed:', error.message);
});

imageConverter.on('end', (result) => {
  console.log('Image conversion completed successfully!');
  console.log(`Conversion took ${result.duration} seconds`);
});

// Start the conversion
imageConverter.start();

// Example 5: Promise-based HLS conversion
console.log('\nExample 5: Promise-based HLS conversion');
console.log('-------------------------------------');

muxy.convertToHLS(inputVideo, hlsOutputDir, {
  hls_time: 4,
  hls_list_size: 0
})
  .then(result => {
    console.log('HLS conversion completed successfully!');
    console.log(`Conversion took ${result.duration} seconds`);
  })
  .catch(error => {
    console.error('HLS conversion failed:', error.message);
  });

// Example 6: Event-based HLS conversion
console.log('\nExample 6: Event-based HLS conversion');
console.log('-----------------------------------');

const hlsConverter = muxy.createHLSConverter(inputVideo, hlsOutputDir, {
  hls_time: 4,
  hls_list_size: 0
});

hlsConverter.on('progress', (progress) => {
  console.log(`Progress: ${progress.percent}% (Frame: ${progress.frame}, FPS: ${progress.fps})`);
});

hlsConverter.on('error', (error) => {
  console.error('HLS conversion failed:', error.message);
});

hlsConverter.on('end', (result) => {
  console.log('HLS conversion completed successfully!');
  console.log(`Conversion took ${result.duration} seconds`);
});

// Start the conversion
hlsConverter.start();

// Example 7: Combining promise and event-based approaches
console.log('\nExample 7: Combining promise and event-based approaches');
console.log('----------------------------------------------------');

const combinedConverter = muxy.createVideoConverter(inputVideo, outputVideo, {
  codec: 'libx264',
  preset: 'fast'
});

// Set up event listeners
combinedConverter.on('progress', (progress) => {
  console.log(`Progress: ${progress.percent}%`);
});

// Start conversion and use promise for completion
combinedConverter.start()
  .then(result => {
    console.log('Combined approach conversion completed!');
    console.log(`Conversion took ${result.duration} seconds`);
  })
  .catch(error => {
    console.error('Combined approach conversion failed:', error.message);
  });