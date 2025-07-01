
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, X } from 'lucide-react';
import { VoiceSettings as VoiceSettingsType } from '@/utils/VoiceService';

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettingsType;
  onUpdateSettings: (settings: Partial<VoiceSettingsType>) => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  const voices = [
    { value: 'alloy', label: 'Alloy (Neutral)' },
    { value: 'echo', label: 'Echo (Male)' },
    { value: 'fable', label: 'Fable (British Male)' },
    { value: 'nova', label: 'Nova (Female)' },
    { value: 'onyx', label: 'Onyx (Deep Male)' },
    { value: 'shimmer', label: 'Shimmer (Female)' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <h3 className="font-semibold">Voice Settings</h3>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Voice</label>
            <Select
              value={settings.voice}
              onValueChange={(value) => onUpdateSettings({ voice: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.value} value={voice.value}>
                    {voice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Speech Speed */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Speech Speed: {settings.speed}x
            </label>
            <Slider
              value={[settings.speed]}
              onValueChange={([value]) => onUpdateSettings({ speed: value })}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Auto-play Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Auto-play responses</label>
            <Switch
              checked={settings.autoPlay}
              onCheckedChange={(checked) => onUpdateSettings({ autoPlay: checked })}
            />
          </div>

          {/* Push-to-talk Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Push-to-talk mode</label>
            <Switch
              checked={settings.pushToTalk}
              onCheckedChange={(checked) => onUpdateSettings({ pushToTalk: checked })}
            />
          </div>

          {/* Test Voice Button */}
          <Button
            onClick={() => {
              // This would trigger a test TTS call
              console.log('Test voice with current settings');
            }}
            variant="outline"
            className="w-full"
          >
            Test Voice
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VoiceSettings;
