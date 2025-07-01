
export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private onPlayStateChange: (isPlaying: boolean) => void;
  private onError: (error: Error) => void;

  constructor(
    onPlayStateChange: (isPlaying: boolean) => void,
    onError: (error: Error) => void
  ) {
    this.onPlayStateChange = onPlayStateChange;
    this.onError = onError;
  }

  async playAudio(base64Audio: string): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stop();

      // Create new audio element
      this.audio = new Audio();
      this.audio.src = `data:audio/mp3;base64,${base64Audio}`;

      // Set up event listeners
      this.audio.onplay = () => this.onPlayStateChange(true);
      this.audio.onpause = () => this.onPlayStateChange(false);
      this.audio.onended = () => this.onPlayStateChange(false);
      this.audio.onerror = () => {
        this.onError(new Error('Audio playback failed'));
        this.onPlayStateChange(false);
      };

      // Play the audio
      await this.audio.play();
    } catch (error) {
      this.onError(error as Error);
    }
  }

  pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  resume(): void {
    if (this.audio && this.audio.paused) {
      this.audio.play().catch(error => {
        this.onError(error);
      });
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    this.onPlayStateChange(false);
  }

  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }
}
