import React from 'react';
import { Volume2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface VoiceSettings {
  voice: string;
  speed: number;
  autoPlay: boolean;
  pushToTalk: boolean;
}

interface VoiceSettingsProps {
  settings: VoiceSettings;
  onSettingsChange: (settings: VoiceSettings) => void;
  isAvatarMode: boolean;
}

const AVATAR_VOICE_CONFIG = {
  voice: 'nova', // Professional, warm voice for Bibhrajit
  speed: 1.0,
  model: 'tts-1-hd', // Higher quality for professional use
  response_format: 'mp3',
};

const VoiceSettingsComponent: React.FC<VoiceSettingsProps> = ({
  settings,
  onSettingsChange,
  isAvatarMode
}) => {
  const handleVoiceChange = (voice: string) => {
    onSettingsChange({ ...settings, voice });
  };

  const handleSpeedChange = (speed: number[]) => {
    onSettingsChange({ ...settings, speed: speed[0] });
  };

  const handleAutoPlayChange = (autoPlay: boolean) => {
    onSettingsChange({ ...settings, autoPlay });
  };

  const handlePushToTalkChange = (pushToTalk: boolean) => {
    onSettingsChange({ ...settings, pushToTalk });
  };

  // Use Avatar-specific voice settings when in Avatar mode
  const effectiveSettings = isAvatarMode ? {
    ...settings,
    voice: AVATAR_VOICE_CONFIG.voice
  } : settings;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Voice Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Voice</label>
          <Select 
            value={effectiveSettings.voice} 
            onValueChange={handleVoiceChange}
            disabled={isAvatarMode} // Lock to nova voice in Avatar mode
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
              <SelectItem value="echo">Echo (Male)</SelectItem>
              <SelectItem value="fable">Fable (Female)</SelectItem>
              <SelectItem value="onyx">Onyx (Male)</SelectItem>
              <SelectItem value="nova">Nova (Professional) {isAvatarMode && "- Bibhrajit's Voice"}</SelectItem>
              <SelectItem value="shimmer">Shimmer (Female)</SelectItem>
            </SelectContent>
          </Select>
          {isAvatarMode && (
            <p className="text-xs text-muted-foreground mt-1">
              Voice locked to professional setting for Bibhrajit AI Avatar
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Speed: {effectiveSettings.speed}x
          </label>
          <Slider
            value={[effectiveSettings.speed]}
            onValueChange={handleSpeedChange}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Auto-play responses</label>
          <Switch
            checked={effectiveSettings.autoPlay}
            onCheckedChange={handleAutoPlayChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Push to talk</label>
          <Switch
            checked={effectiveSettings.pushToTalk}
            onCheckedChange={handlePushToTalkChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceSettingsComponent;