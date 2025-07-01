
import { supabase } from "@/integrations/supabase/client";
import { AudioRecorder } from "./AudioRecorder";
import { AudioPlayer } from "./AudioPlayer";

export interface VoiceSettings {
  voice: string;
  speed: number;
  autoPlay: boolean;
  pushToTalk: boolean;
}

export class VoiceService {
  private recorder: AudioRecorder;
  private player: AudioPlayer;
  private webSpeechRecognition: SpeechRecognition | null = null;
  private settings: VoiceSettings;
  
  constructor(
    private onTranscript: (text: string) => void,
    private onRecordingStateChange: (isRecording: boolean) => void,
    private onPlaybackStateChange: (isPlaying: boolean) => void,
    private onError: (error: string) => void
  ) {
    this.settings = this.loadSettings();
    
    this.recorder = new AudioRecorder(
      this.handleAudioData.bind(this),
      (error) => this.onError(error.message)
    );
    
    this.player = new AudioPlayer(
      this.onPlaybackStateChange,
      (error) => this.onError(error.message)
    );

    this.initWebSpeechAPI();
  }

  private initWebSpeechAPI(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.webSpeechRecognition = new SpeechRecognition();
      this.webSpeechRecognition.continuous = false;
      this.webSpeechRecognition.interimResults = false;
      this.webSpeechRecognition.lang = 'en-US';

      this.webSpeechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.onTranscript(transcript);
        this.onRecordingStateChange(false);
      };

      this.webSpeechRecognition.onerror = (event) => {
        this.onError(`Speech recognition error: ${event.error}`);
        this.onRecordingStateChange(false);
      };

      this.webSpeechRecognition.onend = () => {
        this.onRecordingStateChange(false);
      };
    }
  }

  async startRecording(): Promise<void> {
    try {
      // Try Web Speech API first (faster and free)
      if (this.webSpeechRecognition) {
        this.webSpeechRecognition.start();
        this.onRecordingStateChange(true);
      } else {
        // Fallback to audio recording + Whisper API
        await this.recorder.startRecording();
        this.onRecordingStateChange(true);
      }
    } catch (error) {
      this.onError(`Failed to start recording: ${(error as Error).message}`);
    }
  }

  stopRecording(): void {
    if (this.webSpeechRecognition) {
      this.webSpeechRecognition.stop();
    }
    this.recorder.stopRecording();
    this.onRecordingStateChange(false);
  }

  private async handleAudioData(audioBlob: Blob): Promise<void> {
    try {
      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Send to Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: { audio: base64Audio }
      });

      if (error) {
        throw new Error(error.message);
      }

      this.onTranscript(data.text);
    } catch (error) {
      this.onError(`Speech-to-text failed: ${(error as Error).message}`);
    }
  }

  async speakText(text: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          voice: this.settings.voice,
          speed: this.settings.speed
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (this.settings.autoPlay) {
        await this.player.playAudio(data.audioContent);
      }
    } catch (error) {
      this.onError(`Text-to-speech failed: ${(error as Error).message}`);
    }
  }

  pausePlayback(): void {
    this.player.pause();
  }

  resumePlayback(): void {
    this.player.resume();
  }

  stopPlayback(): void {
    this.player.stop();
  }

  updateSettings(newSettings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  private loadSettings(): VoiceSettings {
    const saved = localStorage.getItem('voiceSettings');
    return saved ? JSON.parse(saved) : {
      voice: 'alloy',
      speed: 1.0,
      autoPlay: true,
      pushToTalk: false
    };
  }

  private saveSettings(): void {
    localStorage.setItem('voiceSettings', JSON.stringify(this.settings));
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  isRecording(): boolean {
    return this.recorder.isRecording() || 
           (this.webSpeechRecognition && this.webSpeechRecognition.constructor.name === 'webkitSpeechRecognition');
  }

  isPlaying(): boolean {
    return this.player.isPlaying();
  }
}
