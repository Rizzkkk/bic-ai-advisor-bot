
export class AvatarVoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecordingState = false;

  async toggleRecording(onTranscription: (text: string) => void): Promise<void> {
    if (this.isRecordingState) {
      this.stopRecording();
    } else {
      await this.startRecording(onTranscription);
    }
  }

  private async startRecording(onTranscription: (text: string) => void): Promise<void> {
    try {
      console.log('AvatarVoiceRecorder: Starting recording');
      
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        await this.processAudio(onTranscription);
      };

      this.mediaRecorder.start(100);
      this.isRecordingState = true;
      
    } catch (error) {
      console.error('AvatarVoiceRecorder: Start recording failed:', error);
    }
  }

  private stopRecording(): void {
    if (this.mediaRecorder && this.isRecordingState) {
      console.log('AvatarVoiceRecorder: Stopping recording');
      this.mediaRecorder.stop();
      this.isRecordingState = false;
    }
  }

  private async processAudio(onTranscription: (text: string) => void): Promise<void> {
    try {
      if (this.audioChunks.length === 0) {
        throw new Error('No audio data recorded');
      }

      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (!base64Audio) throw new Error('Failed to convert audio');

          const response = await fetch('https://oxvzrchcfzmaoftronkm.supabase.co/functions/v1/speech-to-text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dnpyY2hjZnptYW9mdHJvbmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTA5OTAsImV4cCI6MjA2NDkyNjk5MH0.Yn4tOEWm4H5ZLNsEGAp_Q3JyP0RaaMoHnfRRX0R5vOs',
            },
            body: JSON.stringify({ audio: base64Audio }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Speech-to-text failed');
          }

          const result = await response.json();
          if (result.text && result.text.trim()) {
            onTranscription(result.text.trim());
          }

        } catch (err) {
          console.error('AvatarVoiceRecorder: Transcription error:', err);
        }
      };

      reader.readAsDataURL(audioBlob);

    } catch (err) {
      console.error('AvatarVoiceRecorder: Audio processing error:', err);
    } finally {
      this.cleanup();
    }
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecordingState = false;
  }

  isRecording(): boolean {
    return this.isRecordingState;
  }
}
