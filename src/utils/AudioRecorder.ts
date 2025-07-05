
/**
 * Enhanced AudioRecorder utility for recording audio from microphone
 * Includes better error handling and browser compatibility
 */

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private isSupported: boolean = false;

  constructor() {
    // Check browser support
    this.isSupported = this.checkBrowserSupport();
  }

  /**
   * Check if the browser supports required APIs
   */
  private checkBrowserSupport(): boolean {
    return !!(
      navigator.mediaDevices && 
      navigator.mediaDevices.getUserMedia && 
      window.MediaRecorder
    );
  }

  /**
   * Request microphone permission and check compatibility
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      throw new Error('Audio recording is not supported in this browser');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately after permission check
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  /**
   * Start recording audio from microphone
   */
  async startRecording(): Promise<void> {
    if (!this.isSupported) {
      throw new Error('Audio recording is not supported in this browser');
    }

    try {
      console.log('Requesting microphone access...');
      
      // Request microphone access with specific constraints
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('Microphone access granted, setting up recorder...');

      // Determine the best MIME type for this browser
      const mimeType = this.getBestMimeType();
      
      // Create MediaRecorder with the supported MIME type
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: mimeType
      });

      // Clear previous chunks
      this.audioChunks = [];

      // Handle data available event
      this.mediaRecorder.ondataavailable = (event) => {
        console.log('Audio data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Handle errors
      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      console.log('Recording started with MIME type:', mimeType);
    } catch (error) {
      console.error('Error starting recording:', error);
      this.cleanup();
      
      if (error.name === 'NotAllowedError') {
        throw new Error('Microphone access denied. Please allow microphone access and try again.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      } else {
        throw new Error('Failed to start recording: ' + error.message);
      }
    }
  }

  /**
   * Get the best supported MIME type for recording
   */
  private getBestMimeType(): string {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }

    // Fallback to default if none are explicitly supported
    return 'audio/webm';
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error('Recording stop timeout'));
      }, 5000); // 5 second timeout

      this.mediaRecorder.onstop = () => {
        clearTimeout(timeoutId);
        
        try {
          // Create final audio blob
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          
          console.log('Recording stopped, created blob:', audioBlob.size, 'bytes, type:', mimeType);
          
          // Cleanup
          this.cleanup();
          
          resolve(audioBlob);
        } catch (error) {
          console.error('Error creating audio blob:', error);
          this.cleanup();
          reject(error);
        }
      };

      this.mediaRecorder.onerror = (error) => {
        clearTimeout(timeoutId);
        console.error('Recording error:', error);
        this.cleanup();
        reject(error);
      };

      // Stop recording
      this.mediaRecorder.stop();
      console.log('Stopping recording...');
    });
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /**
   * Get recording duration in seconds
   */
  getRecordingDuration(): number {
    // This would need to be tracked separately if needed
    return 0;
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped audio track');
      });
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  /**
   * Cancel recording without returning audio
   */
  cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
    console.log('Recording cancelled');
  }

  /**
   * Check if the browser supports audio recording
   */
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices && 
      navigator.mediaDevices.getUserMedia && 
      window.MediaRecorder
    );
  }
}
