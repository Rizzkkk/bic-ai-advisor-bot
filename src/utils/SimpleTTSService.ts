
export class SimpleTTSService {
  private currentAudio: HTMLAudioElement | null = null;

  async speak(text: string, voice: string = 'nova'): Promise<void> {
    try {
      console.log('Generating speech for:', text.substring(0, 50) + '...');
      
      // Stop any currently playing audio
      this.stop();

      const response = await fetch('https://oxvzrchcfzmaoftronkm.supabase.co/functions/v1/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94dnpyY2hjZnptYW9mdHJvbmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTA5OTAsImV4cCI6MjA2NDkyNjk5MH0.Yn4tOEWm4H5ZLNsEGAp_Q3JyP0RaaMoHnfRRX0R5vOs',
        },
        body: JSON.stringify({
          text,
          voice,
          speed: 1.0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'TTS failed');
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
          console.error('Audio playback error:', error);
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
        };

        this.currentAudio = audio;
        await audio.play();
        
        console.log('TTS playback started successfully');
      }
    } catch (error) {
      console.error('TTS Error:', error);
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

export const simpleTTSService = new SimpleTTSService();
