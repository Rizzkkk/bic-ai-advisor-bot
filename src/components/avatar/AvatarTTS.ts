
export class AvatarTTS {
  private currentAudio: HTMLAudioElement | null = null;
  private readonly apiUrl = 'https://oxvzrchcfzmaoftronkm.supabase.co/functions/v1/text-to-speech';
  private readonly apiKey = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dnpyY2hjZnptYW9mdHJvbmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTA5OTAsImV4cCI6MjA2NDkyNjk5MH0.Yn4tOEWm4H5ZLNsEGAp_Q3JyP0RaaMoHnfRRX0R5vOs';

  async speak(text: string, voice: string = 'nova'): Promise<void> {
    try {
      console.log('AvatarTTS: Generating speech for:', text.substring(0, 50) + '...');
      
      // Stop any currently playing audio
      this.stop();

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey,
        },
        body: JSON.stringify({
          text,
          voice,
          speed: 1.0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS API failed');
      }

      const result = await response.json();
      
      if (result.audioContent) {
        // Convert base64 to audio blob
        const audioBlob = new Blob(
          [Uint8Array.from(atob(result.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Play audio
        const audio = new HTMLAudioElement();
        audio.src = audioUrl;
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
        };
        
        audio.onerror = (error) => {
          console.error('AvatarTTS: Audio playback error:', error);
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
        };

        this.currentAudio = audio;
        await audio.play();
        
        console.log('AvatarTTS: Playback started successfully');
      }
    } catch (error) {
      console.error('AvatarTTS: Error:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}
