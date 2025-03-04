import { spawn } from 'child_process';
import { existsSync } from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

// Types
interface ConversionOptions {
  format?: string;
  codec?: string;
  preset?: string;
  width?: number;
  height?: number;
  bitrate?: string;
  quality?: number;
  [key: string]: any;
}

interface ConversionResult {
  inputFile: string;
  outputFile: string;
  options: ConversionOptions;
  duration: number;
  success: boolean;
}

interface ProgressData {
  percent: number;
  frame: number;
  fps: number;
  time: string;
}

// Conversion class that extends EventEmitter
class Converter extends EventEmitter {
  private inputFile: string;
  private outputFile: string;
  private options: ConversionOptions;
  
  constructor(inputFile: string, outputFile: string, options: ConversionOptions = {}) {
    super();
    this.inputFile = inputFile;
    this.outputFile = outputFile;
    this.options = options;
  }

  // Start the conversion process
  start(): Promise<ConversionResult> {
    // Check if input file exists
    if (!existsSync(this.inputFile)) {
      const error = new Error(`Input file does not exist: ${this.inputFile}`);
      this.emit('error', error);
      return Promise.reject(error);
    }

    // Check if ffmpeg is installed
    if (!checkFfmpegInstalled()) {
      const error = new Error('ffmpeg is not installed or not in PATH');
      this.emit('error', error);
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let duration = 0;

      // Build ffmpeg arguments
      const args = ['-i', this.inputFile];

      // Add options
      if (this.options.codec) {
        args.push('-c:v', this.options.codec);
      }

      if (this.options.preset) {
        args.push('-preset', this.options.preset);
      }

      if (this.options.width && this.options.height) {
        args.push('-s', `${this.options.width}x${this.options.height}`);
      }

      if (this.options.bitrate) {
        args.push('-b:v', this.options.bitrate);
      }

      if (this.options.quality) {
        args.push('-q:v', this.options.quality.toString());
      }

      // Add output format if specified
      if (this.options.format) {
        args.push('-f', this.options.format);
      }

      // Add progress output
      args.push('-progress', 'pipe:1');

      // Add output file
      args.push(this.outputFile);

      // Spawn ffmpeg process
      const ffmpeg = spawn('ffmpeg', args);
      
      // Get video duration first
      const ffprobe = spawn('ffprobe', [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        this.inputFile
      ]);

      ffprobe.stdout.on('data', (data) => {
        duration = parseFloat(data.toString());
      });

      // Handle progress
      ffmpeg.stdout.on('data', (data) => {
        if (duration > 0) {
          const progress = parseProgress(data.toString());
          const timeInSeconds = progress.time.split(':').reduce((acc, time, index) => {
            if (index === 0) return acc + parseInt(time) * 3600;
            if (index === 1) return acc + parseInt(time) * 60;
            return acc + parseFloat(time);
          }, 0);
          
          progress.percent = Math.min(Math.round((timeInSeconds / duration) * 100), 100);
          this.emit('progress', progress);
        }
      });

      // Handle errors
      ffmpeg.stderr.on('data', (data) => {
        // ffmpeg outputs progress info to stderr, so we don't treat this as an error
        // console.error(`stderr: ${data}`);
      });

      ffmpeg.on('error', (error) => {
        this.emit('error', error);
        reject(error);
      });

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          const error = new Error(`ffmpeg process exited with code ${code}`);
          this.emit('error', error);
          reject(error);
          return;
        }

        const result: ConversionResult = {
          inputFile: this.inputFile,
          outputFile: this.outputFile,
          options: this.options,
          duration: (Date.now() - startTime) / 1000,
          success: true
        };

        this.emit('end', result);
        resolve(result);
      });
    });
  }
}

// Helper function to check if ffmpeg is installed
const checkFfmpegInstalled = (): boolean => {
  try {
    const result = spawn('ffmpeg', ['-version']);
    return true;
  } catch (error) {
    return false;
  }
};

// Parse ffmpeg progress output
const parseProgress = (data: string): ProgressData => {
  const frame = data.match(/frame=\s*(\d+)/)?.[1] || '0';
  const fps = data.match(/fps=\s*(\d+)/)?.[1] || '0';
  const time = data.match(/time=\s*(\d{2}:\d{2}:\d{2}\.\d{2})/)?.[1] || '00:00:00.00';
  
  return {
    percent: 0, // Will be calculated when duration is known
    frame: parseInt(frame),
    fps: parseInt(fps),
    time
  };
};

// Promise-based API implementation
const convert = async (
  inputFile: string,
  outputFile: string,
  options: ConversionOptions = {}
): Promise<ConversionResult> => {
  const converter = new Converter(inputFile, outputFile, options);
  return converter.start();
};

/**
 * Creates a video converter instance for event-based API
 * 
 * @param inputFile Path to the input video file
 * @param outputFile Path to the output video file
 * @param options Conversion options
 * @returns Converter instance with event emitters
 */
const createVideoConverter = (
  inputFile: string,
  outputFile: string,
  options: ConversionOptions = {}
): Converter => {
  return new Converter(inputFile, outputFile, options);
};

/**
 * Promise-based API for video conversion
 * 
 * @param inputFile Path to the input video file
 * @param outputFile Path to the output video file
 * @param options Conversion options
 * @returns Promise<ConversionResult>
 */
const convertVideo = (
  inputFile: string,
  outputFile: string,
  options: ConversionOptions = {}
): Promise<ConversionResult> => {
  return convert(inputFile, outputFile, options);
};

/**
 * Creates an image converter instance for event-based API
 * 
 * @param inputFile Path to the input image file
 * @param outputFile Path to the output image file
 * @param options Conversion options
 * @returns Converter instance with event emitters
 */
const createImageConverter = (
  inputFile: string,
  outputFile: string,
  options: ConversionOptions = {}
): Converter => {
  const imageOptions = { ...options };
  return new Converter(inputFile, outputFile, imageOptions);
};

/**
 * Promise-based API for image conversion
 * 
 * @param inputFile Path to the input image file
 * @param outputFile Path to the output image file
 * @param options Conversion options
 * @returns Promise<ConversionResult>
 */
const convertImage = (
  inputFile: string,
  outputFile: string,
  options: ConversionOptions = {}
): Promise<ConversionResult> => {
  const imageOptions = { ...options };
  return convert(inputFile, outputFile, imageOptions);
};

/**
 * Creates an HLS converter instance for event-based API
 * 
 * @param inputFile Path to the input video file
 * @param outputDirectory Path to the output directory for HLS files
 * @param options Conversion options
 * @returns Converter instance with event emitters
 */
const createHLSConverter = (
  inputFile: string,
  outputDirectory: string,
  options: ConversionOptions = {}
): Converter => {
  const outputFile = path.join(outputDirectory, 'master.m3u8');
  const hlsOptions = {
    ...options,
    format: 'hls',
    hls_time: options.hls_time || 6,
    hls_list_size: options.hls_list_size || 0,
    hls_segment_filename: path.join(outputDirectory, 'segment_%03d.ts')
  };
  
  return new Converter(inputFile, outputFile, hlsOptions);
};

/**
 * Promise-based API for HLS conversion
 * 
 * @param inputFile Path to the input video file
 * @param outputDirectory Path to the output directory for HLS files
 * @param options Conversion options
 * @returns Promise<ConversionResult>
 */
const convertToHLS = (
  inputFile: string,
  outputDirectory: string,
  options: ConversionOptions = {}
): Promise<ConversionResult> => {
  const outputFile = path.join(outputDirectory, 'master.m3u8');
  const hlsOptions = {
    ...options,
    format: 'hls',
    hls_time: options.hls_time || 6,
    hls_list_size: options.hls_list_size || 0,
    hls_segment_filename: path.join(outputDirectory, 'segment_%03d.ts')
  };
  
  return convert(inputFile, outputFile, hlsOptions);
};

// Create the muxy object with all functions
const muxy = {
  // Promise-based API
  convert,
  convertVideo,
  convertImage,
  convertToHLS,
  
  // Event-based API
  createConverter: createVideoConverter,
  createVideoConverter,
  createImageConverter,
  createHLSConverter
};

export default muxy;
