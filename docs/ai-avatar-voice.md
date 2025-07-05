
# AI Avatar Voice System Documentation

## Overview
The Bibhrajit AI Avatar features a sophisticated voice conversation system that enables natural speech-to-text input and text-to-speech output for seamless voice interactions.

## Architecture

### Speech-to-Text (STT) Pipeline
1. **Audio Recording**: Browser-based microphone capture using MediaRecorder API
2. **Audio Processing**: Real-time audio chunking and base64 encoding
3. **Transcription**: OpenAI Whisper API integration via Supabase Edge Function
4. **Error Handling**: Comprehensive browser compatibility and permission management

### Text-to-Speech (TTS) Pipeline
1. **Text Processing**: AI response preparation for natural speech
2. **Voice Synthesis**: OpenAI TTS API with 'nova' voice (professional Bibhrajit voice)
3. **Audio Delivery**: Streaming audio playback with queue management
4. **User Controls**: Play, pause, resume, and stop functionality

## Technical Implementation

### Key Components

#### AudioRecorder Class (`src/utils/AudioRecorder.ts`)
- Browser compatibility checking
- Microphone permission management
- Multi-format audio recording (WebM, MP4, OGG, WAV)
- Real-time audio chunking
- Error handling and cleanup

#### TTSService Class (`src/utils/TTSService.ts`)
- OpenAI TTS integration
- Audio queue management for sequential playback
- Browser audio context optimization
- Comprehensive error handling
- Voice selection and speed control

#### VoiceInput Component (`src/components/chat/VoiceInput.tsx`)
- Visual recording indicators
- Push-to-talk and continuous recording modes
- Real-time recording status feedback
- Accessibility features

### Edge Functions

#### Speech-to-Text (`supabase/functions/speech-to-text/index.ts`)
```typescript
// Processes audio blob to text using OpenAI Whisper
// Handles multiple audio formats
// Includes comprehensive error handling
```

#### Text-to-Speech (`supabase/functions/text-to-speech/index.ts`)
```typescript
// Converts text to natural speech using OpenAI TTS
// Returns base64 encoded MP3 audio
// Optimized for 'nova' voice (Bibhrajit's professional voice)
```

## Voice Features

### Recording Capabilities
- **Multi-browser Support**: Chrome, Firefox, Safari, Edge
- **Audio Quality**: 44.1kHz, mono, with noise suppression
- **Format Flexibility**: Automatic format detection and fallbacks
- **Permission Handling**: User-friendly microphone access requests

### Playback Features
- **Professional Voice**: OpenAI 'nova' voice for Bibhrajit AI Avatar
- **Speed Control**: 0.5x to 2.0x playback speed
- **Queue Management**: Sequential audio playback for long responses
- **Interruption Support**: Stop current audio when new input received

### Avatar Mode Integration
- **Automatic TTS**: AI responses automatically played in Avatar mode
- **Visual Feedback**: Clear indicators for listening, processing, and speaking states
- **Seamless Switching**: Easy toggle between text and voice interaction modes

## Browser Compatibility

### Supported Browsers
- **Chrome/Chromium**: Full support with optimal performance
- **Firefox**: Full support with WebM recording
- **Safari**: Full support with MP4 recording
- **Edge**: Full support with WebM recording

### Fallback Strategies
- Automatic MIME type detection
- Progressive audio format fallbacks
- Graceful degradation to text-only mode
- Clear error messages for unsupported browsers

## Security & Privacy

### Audio Data Handling
- **No Local Storage**: Audio data processed in memory only
- **Secure Transmission**: HTTPS-only API communications
- **Automatic Cleanup**: Audio blobs disposed after processing
- **Permission Respect**: Clear microphone permission requests

### API Security
- **Environment Variables**: Secure API key management
- **CORS Configuration**: Proper cross-origin request handling
- **Input Validation**: Comprehensive request validation
- **Error Sanitization**: Safe error message handling

## Performance Optimization

### Audio Processing
- **Chunked Recording**: 100ms audio chunks for responsiveness
- **Efficient Encoding**: Optimized base64 conversion
- **Memory Management**: Automatic resource cleanup
- **Network Optimization**: Compressed audio transmission

### User Experience
- **Loading States**: Clear feedback during processing
- **Error Recovery**: Automatic retry mechanisms
- **Offline Handling**: Graceful degradation when APIs unavailable
- **Mobile Optimization**: Touch-friendly voice controls

## Troubleshooting

### Common Issues

#### Recording Problems
- **No Microphone Access**: Check browser permissions
- **Recording Fails**: Verify browser compatibility
- **No Audio Data**: Check microphone connection
- **Permission Denied**: Guide user through browser settings

#### Playback Problems
- **No Audio Output**: Check speaker/headphone connection
- **Audio Blocked**: User interaction required for autoplay
- **Playback Fails**: Verify audio format support
- **Quality Issues**: Check network connection

### Debug Tools
- **Console Logging**: Comprehensive debug information
- **Error Messages**: User-friendly error descriptions
- **Browser Detection**: Automatic compatibility checking
- **Permission Status**: Clear permission state indicators

## Future Enhancements

### Planned Features
- **Voice Cloning**: Custom Bibhrajit voice training
- **Multi-language Support**: International language recognition
- **Advanced Controls**: Pitch, tone, and emotion adjustment
- **Real-time Streaming**: Streaming TTS for faster response times

### Technical Improvements
- **WebRTC Integration**: Real-time communication protocols
- **Edge Computing**: Local audio processing capabilities
- **AI Voice Training**: Custom voice model development
- **Performance Analytics**: Voice interaction monitoring
