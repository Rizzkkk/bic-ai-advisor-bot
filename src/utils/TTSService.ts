
/**
 * Enhanced Text-to-Speech Service for AI Avatar
 * Handles converting AI responses to natural speech with better error handling
 */

export interface TTSSettings {
  voice: string;
  speed: number;
  autoPlay: boolean;
}

export class TTSService {
  private currentAudio: HTMLAudioElement | null = null;
  private audioQueue: string[] = [];
  private isPlaying: boolean = false;
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize audio context for better browser compatibility
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        this.audioContext = new AudioContext();
      } catch (error) {
        console.warn('AudioContext not available:', error);
      }
    }
  }

  /**
   * Convert text to speech using OpenAI TTS API
   */
  async generateSpeech(text: string, settings: TTSSettings): Promise<string> {
    try {
      console.log('Generating speech for text:', text.substring(0, 50) + '...');
      
      const response = await fetch('https://oxvzrchcfzmaoftronkm.supabase.co/functions/v1/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: settings.voice || 'nova',
          speed: settings.speed || 1.0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const result = await response.json();
      console.log('TTS response received');
      
      if (result.audioContent) {
        // Convert base64 to audio URL
        const audioBlob = new Blob(
          [Uint8Array.from(atob(result.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Audio URL created:', audioUrl);
        return audioUrl;
      }
      
      throw new Error('No audio content received from TTS service');
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }

  /**
   * Play audio from URL with better error handling
   */
  async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop current audio if playing
        this.stopAudio();

        console.log('Creating new audio element for playback...');
        const audio = new HTMLAudioElement();
        
        // Set up error handling before setting src
        audio.onerror = (event) => {
          console.error('Audio playback error:', event);
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl); // Cleanup
          reject(new Error('Audio playback failed. Please check your speakers.'));
        };

        audio.onloadstart = () => {
          console.log('Audio loading started...');
        };

        audio.oncanplay = () => {
          console.log('Audio can play, starting playback...');
        };

        audio.onended = () => {
          console.log('Audio playback ended');
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl); // Cleanup
          resolve();
        };

        audio.onpause = () => {
          console.log('Audio paused');
          this.isPlaying = false;
        };

        audio.onplay = () => {
          console.log('Audio started playing');
          this.isPlaying = true;
        };

        // Set audio properties
        audio.preload = 'auto';
        audio.volume = 1.0;
        audio.src = audioUrl;
        
        // Store reference
        this.currentAudio = audio;

        // Attempt to play
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playback started successfully');
            })
            .catch((error) => {
              console.error('Play promise rejected:', error);
              this.isPlaying = false;
              URL.revokeObjectURL(audioUrl);
              
              if (error.name === 'NotAllowedError') {
                reject(new Error('Audio playback blocked. Please interact with the page first.'));
              } else {
                reject(new Error('Failed to play audio: ' + error.message));
              }
            });
        }

      } catch (error) {
        console.error('Error setting up audio playback:', error);
        this.isPlaying = false;
        URL.revokeObjectURL(audioUrl);
        reject(error);
      }
    });
  }

  /**
   * Speak text (generate and play)
   */
  async speak(text: string, settings: TTSSettings): Promise<void> {
    try {
      console.log('Starting speak process...');
      const audioUrl = await this.generateSpeech(text, settings);
      await this.playAudio(audioUrl);
      console.log('Speak process completed successfully');
    } catch (error) {
      console.error('Failed to speak text:', error);
      throw error;
    }
  }

  /**
   * Add text to queue for sequential playback
   */
  async queueSpeech(text: string, settings: TTSSettings): Promise<void> {
    this.audioQueue.push(text);
    console.log('Added text to speech queue. Queue length:', this.audioQueue.length);
    
    if (!this.isPlaying) {
      await this.processQueue(settings);
    }
  }

  /**
   * Process audio queue
   */
  private async processQueue(settings: TTSSettings): Promise<void> {
    console.log('Processing speech queue...');
    
    while (this.audioQueue.length > 0) {
      const text = this.audioQueue.shift()!;
      try {
        await this.speak(text, settings);
      } catch (error) {
        console.error('Failed to process queued speech:', error);
        // Continue with next item even if current fails
      }
    }
    
    console.log('Speech queue processing completed');
  }

  /**
   * Stop current audio playback
   */
  stopAudio(): void {
    if (this.currentAudio) {
      console.log('Stopping current audio...');
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  /**
   * Pause current audio
   */
  pauseAudio(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      console.log('Pausing audio...');
      this.currentAudio.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Resume paused audio
   */
  resumeAudio(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      console.log('Resuming audio...');
      const playPromise = this.currentAudio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
          })
          .catch((error) => {
            console.error('Failed to resume audio:', error);
          });
      }
    }
  }

  /**
   * Clear audio queue
   */
  clearQueue(): void {
    this.audioQueue = [];
    console.log('Audio queue cleared');
  }

  /**
   * Check if currently playing audio
   */
  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get available voices with better descriptions
   */
  getAvailableVoices(): Array<{ id: string; name: string; description: string }> {
    return [
      { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice' },
      { id: 'echo', name: 'Echo', description: 'Male, clear voice' },
      { id: 'fable', name: 'Fable', description: 'Female, warm voice' },
      { id: 'onyx', name: 'Onyx', description: 'Male, deep voice' },
      { id: 'nova', name: 'Nova', description: 'Professional, versatile voice (Recommended for Bibhrajit)' },
      { id: 'shimmer', name: 'Shimmer', description: 'Female, bright voice' },
    ];
  }

  /**
   * Test audio playback capability
   */
  async testAudioPlayback(): Promise<boolean> {
    try {
      // Create a short silent audio for testing
      const audioContext = new AudioContext();
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
      
      return true;
    } catch (error) {
      console.error('Audio playback test failed:', error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopAudio();
    this.clearQueue();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    console.log('TTS Service cleaned up');
  }
}
