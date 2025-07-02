
/**
 * Enhanced Voice Service for AI Avatar TTS Integration
 * Implements OpenAI TTS API for natural Bibhrajit voice synthesis
 */

export interface VoiceSettings {
  voice: string;
  speed: number;
  autoPlay: boolean;
  pushToTalk: boolean;
}

export interface TTSResponse {
  audioUrl: string;
  duration: number;
}

export class VoiceService {
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    // Initialize audio context if available
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Generate speech from text using OpenAI TTS API
   */
  async generateSpeech(text: string, settings: VoiceSettings): Promise<TTSResponse> {
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: settings.voice || 'alloy',
          speed: settings.speed || 1.0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return {
        audioUrl,
        duration: 0, // Could be calculated if needed
      };
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }

  /**
   * Play audio with controls
   */
  async playAudio(audioUrl: string, onComplete?: () => void): Promise<void> {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        onComplete?.();
        resolve();
      };

      audio.onerror = () => {
        reject(new Error('Audio playback failed'));
      };

      audio.play().catch(reject);
    });
  }

  /**
   * Pause current audio
   */
  pauseAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }

  /**
   * Resume current audio
   */
  resumeAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.play();
    }
  }

  /**
   * Stop current audio
   */
  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): Array<{ id: string; name: string; gender: string }> {
    return [
      { id: 'alloy', name: 'Alloy', gender: 'neutral' },
      { id: 'echo', name: 'Echo', gender: 'male' },
      { id: 'fable', name: 'Fable', gender: 'female' },
      { id: 'onyx', name: 'Onyx', gender: 'male' },
      { id: 'nova', name: 'Nova', gender: 'female' },
      { id: 'shimmer', name: 'Shimmer', gender: 'female' },
    ];
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopAudio();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
