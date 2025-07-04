/**
 * Text-to-Speech Service for AI Avatar
 * Handles converting AI responses to natural speech
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

  /**
   * Convert text to speech using OpenAI TTS API
   */
  async generateSpeech(text: string, settings: TTSSettings): Promise<string> {
    try {
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
        throw new Error('Failed to generate speech');
      }

      const result = await response.json();
      
      if (result.audioContent) {
        // Convert base64 to audio URL
        const audioBlob = new Blob(
          [Uint8Array.from(atob(result.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        return URL.createObjectURL(audioBlob);
      }
      
      throw new Error('No audio content received');
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }

  /**
   * Play audio from URL
   */
  async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop current audio if playing
      this.stopAudio();

      const audio = new HTMLAudioElement();
      audio.src = audioUrl;
      audio.preload = 'auto';
      
      audio.onended = () => {
        this.isPlaying = false;
        URL.revokeObjectURL(audioUrl); // Cleanup
        resolve();
      };

      audio.onerror = () => {
        this.isPlaying = false;
        URL.revokeObjectURL(audioUrl); // Cleanup
        reject(new Error('Audio playback failed'));
      };

      audio.oncanplaythrough = () => {
        this.currentAudio = audio;
        this.isPlaying = true;
        audio.play().catch(reject);
      };

      audio.load();
    });
  }

  /**
   * Speak text (generate and play)
   */
  async speak(text: string, settings: TTSSettings): Promise<void> {
    try {
      const audioUrl = await this.generateSpeech(text, settings);
      await this.playAudio(audioUrl);
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
    
    if (!this.isPlaying) {
      await this.processQueue(settings);
    }
  }

  /**
   * Process audio queue
   */
  private async processQueue(settings: TTSSettings): Promise<void> {
    while (this.audioQueue.length > 0) {
      const text = this.audioQueue.shift()!;
      try {
        await this.speak(text, settings);
      } catch (error) {
        console.error('Failed to process queued speech:', error);
        // Continue with next item even if current fails
      }
    }
  }

  /**
   * Stop current audio playback
   */
  stopAudio(): void {
    if (this.currentAudio) {
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
      this.currentAudio.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Resume paused audio
   */
  resumeAudio(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
      this.isPlaying = true;
    }
  }

  /**
   * Clear audio queue
   */
  clearQueue(): void {
    this.audioQueue = [];
  }

  /**
   * Check if currently playing audio
   */
  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): Array<{ id: string; name: string; description: string }> {
    return [
      { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice' },
      { id: 'echo', name: 'Echo', description: 'Male, clear voice' },
      { id: 'fable', name: 'Fable', description: 'Female, warm voice' },
      { id: 'onyx', name: 'Onyx', description: 'Male, deep voice' },
      { id: 'nova', name: 'Nova', description: 'Professional, versatile voice (Bibhrajit\'s voice)' },
      { id: 'shimmer', name: 'Shimmer', description: 'Female, bright voice' },
    ];
  }
}