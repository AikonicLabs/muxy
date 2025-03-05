import { spawn } from 'child_process';
import { existsSync } from 'fs';
import * as path from 'path';
import * as os from 'os';
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
  // AV1 specific options
  speed?: number;        // Encoding speed (0-10, higher is faster)
  tileColumns?: number;  // Number of tile columns
  tileRows?: number;     // Number of tile rows
  keyframeInterval?: number; // Keyframe interval
  threads?: number;      // Number of threads to use for encoding
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
    return new Promise((resolve, reject) => {
      // Check if input file exists
      if (!existsSync(this.inputFile)) {
        const error = new Error(`Input file does not exist: ${this.inputFile}`);
        this.emit('error', error);
        reject(error);
        return;
      }

      // Prepare FFmpeg arguments
      const args = this.buildFfmpegArgs();

      // Spawn FFmpeg process
      const ffmpeg = spawn('ffmpeg', args);
      let duration = 0;

      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString();
        
        // Extract duration information
        if (duration === 0) {
          const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})/);
          if (durationMatch) {
            const hours = parseInt(durationMatch[1]);
            const minutes = parseInt(durationMatch[2]);
            const seconds = parseInt(durationMatch[3]);
            duration = hours * 3600 + minutes * 60 + seconds;
          }
        }

        // Parse progress information
        if (output.includes('time=')) {
          const progress = this.parseProgress(output);
          if (duration > 0) {
            // Calculate percent based on time
            const timeComponents = progress.time.split(':');
            const timeSeconds = 
              parseInt(timeComponents[0]) * 3600 + 
              parseInt(timeComponents[1]) * 60 + 
              parseFloat(timeComponents[2]);
            progress.percent = (timeSeconds / duration) * 100;
          }
          this.emit('progress', progress);
        }
      });

      ffmpeg.on('error', (error) => {
        this.emit('error', error);
        reject(error);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          const result: ConversionResult = {
            inputFile: this.inputFile,
            outputFile: this.outputFile,
            options: this.options,
            duration: duration,
            success: true
          };
          this.emit('end', result);
          resolve(result);
        } else {
          const error = new Error(`FFmpeg exited with code ${code}`);
          this.emit('error', error);
          reject(error);
        }
      });
    });
  }

  // Build FFmpeg arguments based on options
  private buildFfmpegArgs(): string[] {
    const args = ['-y', '-i', this.inputFile];

    // Add codec if specified
    if (this.options.codec) {
      args.push('-c:v', this.options.codec);
    }

    // Add pixel format if specified
    if (this.options.pixFmt) {
      args.push('-pix_fmt', this.options.pixFmt);
    }

    // Add preset if specified
    if (this.options.preset) {
      args.push('-preset', this.options.preset);
    }

    // Add width and height if specified
    if (this.options.width && this.options.height) {
      args.push('-s', `${this.options.width}x${this.options.height}`);
    }

    // Add bitrate if specified
    if (this.options.bitrate) {
      args.push('-b:v', this.options.bitrate);
    }

    // Add quality if specified (for image conversion)
    if (this.options.quality) {
      args.push('-q:v', this.options.quality.toString());
    }
    
    // Handle rav1e-specific options
    if (this.options.codec === 'librav1e') {
      // Build rav1e params string
      const rav1eParams: string[] = [];
      
      // Add speed parameter
      if (this.options.speed !== undefined) {
        rav1eParams.push(`speed=${this.options.speed}`);
      }
      
      // Add tile configuration
      if (this.options.tileColumns !== undefined) {
        rav1eParams.push(`tile-cols=${this.options.tileColumns}`);
      }
      
      if (this.options.tileRows !== undefined) {
        rav1eParams.push(`tile-rows=${this.options.tileRows}`);
      }
      
      // Add threads parameter for multi-threading
      if (this.options.threads !== undefined) {
        rav1eParams.push(`threads=${this.options.threads}`);
      } else {
        // Default to using all available CPU cores
        const cpuCount = os.cpus().length;
        rav1eParams.push(`threads=${cpuCount}`);
      }
      
      // Add keyframe interval
      if (this.options.keyframeInterval !== undefined) {
        args.push('-g', this.options.keyframeInterval.toString());
      }
      
      // Add rav1e params if any were specified
      if (rav1eParams.length > 0) {
        args.push('-rav1e-params', rav1eParams.join(':'));
      }
      
      // Enable row multi-threading for additional parallelism
      args.push('-row-mt', '1');
    }

    // Add any extra options
    if (this.options.extraOptions) {
      args.push(...this.options.extraOptions);
    }

    // Add output file
    args.push(this.outputFile);

    return args;
  }

  // Parse ffmpeg progress output
  private parseProgress(data: string): ProgressData {
    const frame = data.match(/frame=\s*(\d+)/)?.[1] || '0';
    const fps = data.match(/fps=\s*(\d+)/)?.[1] || '0';
    const time = data.match(/time=\s*(\d{2}:\d{2}:\d{2}\.\d{2})/)?.[1] || '00:00:00.00';
  
    return {
      percent: 0, // Will be calculated when duration is known
      frame: parseInt(frame),
      fps: parseInt(fps),
      time
    };
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
