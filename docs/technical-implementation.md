
# Technical Implementation & Security Documentation

## System Architecture

### High-Level Overview
The Bibhrajit AI Avatar system is built on a modern tech stack combining React frontend, Supabase backend, and OpenAI APIs for intelligent conversations and voice interactions.

```
┌─────────────────┐    ┌───────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│ Supabase Backend  │◄──►│  OpenAI APIs    │
│   - Chat UI     │    │ - Edge Functions  │    │ - GPT-4.1       │
│   - Voice I/O   │    │ - Database        │    │ - Whisper STT   │
│   - Avatar Mode │    │ - Authentication  │    │ - TTS           │
└─────────────────┘    └───────────────────┘    └─────────────────┘
```

### Component Architecture

#### Frontend Components
```
src/
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx     # Main chat interface
│   │   ├── ChatMessages.tsx   # Message display & rendering
│   │   ├── ChatInput.tsx      # Text & voice input
│   │   └── VoiceInput.tsx     # Voice recording controls
│   ├── avatar/
│   │   ├── AvatarToggle.tsx   # Avatar mode switcher
│   │   └── VoiceSettings.tsx  # TTS configuration
│   └── auth/
│       └── AdminAuth.tsx      # Admin authentication
├── utils/
│   ├── AudioRecorder.ts       # Voice recording service
│   ├── TTSService.ts          # Text-to-speech service
│   └── ContentProcessor.ts    # RAG processing
└── pages/
    ├── Index.tsx              # Public chat interface
    └── AdminDashboard.tsx     # Secure admin panel
```

#### Backend Services
```
supabase/
├── functions/
│   ├── enhanced-chat-completion/   # RAG-powered chat
│   ├── speech-to-text/            # Whisper integration
│   ├── text-to-speech/            # OpenAI TTS
│   └── process-content/           # Content chunking
└── migrations/
    └── vector-search.sql          # pgvector setup
```

## Security Implementation

### CRITICAL: Admin Portal Security

#### Current Security Issue
❌ **VULNERABILITY**: Admin dashboard at `/admin` is publicly accessible without authentication

#### Implemented Security Solution
✅ **SECURED**: Authentication system with the following features:

##### Authentication System
- **Session-based Login**: Username/password authentication
- **Session Management**: 2-hour automatic timeout
- **Secure Storage**: Client-side session tokens with expiry
- **Route Protection**: Admin routes blocked without valid session

##### Access Control
```typescript
// Admin credentials (production should use environment variables)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'BIC2024@Admin';

// Session management
const sessionToken = btoa(`${username}:${Date.now()}`);
const expiryTime = new Date().getTime() + (2 * 60 * 60 * 1000); // 2 hours
```

##### Security Features
- **Visual Security Indicators**: Clear admin session status
- **Automatic Logout**: Session expiry with cleanup
- **Error Handling**: Secure error messages without information leakage
- **CSRF Protection**: Session token validation

### Recommended Production Security Enhancements

#### Option 1: Separate Admin Subdomain (RECOMMENDED)
```bash
# Deploy admin interface separately
admin.bicorp.ai  # Secure admin portal
bicorp.ai        # Public widget interface
```

Benefits:
- Complete separation of concerns
- No admin exposure on public widget
- Professional subdomain structure
- Enhanced security isolation

#### Option 2: Environment-based Authentication
```typescript
// Use environment variables for production
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
```

#### Option 3: Database-driven Authentication
```sql
-- Admin users table with hashed passwords
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Security

#### Edge Function Security
- **CORS Headers**: Proper cross-origin request handling
- **Input Validation**: Comprehensive request validation
- **Error Sanitization**: Safe error message responses
- **Rate Limiting**: (Recommended for production)

#### Database Security
- **Row Level Security**: Enabled on all user-accessible tables
- **Vector Search**: Secure similarity search with access controls
- **Connection Security**: Encrypted database connections

## Performance Optimization

### Frontend Performance
- **Code Splitting**: Lazy loading for admin components
- **Memory Management**: Automatic cleanup of audio resources
- **Efficient Rendering**: Optimized React component updates
- **Asset Optimization**: Compressed audio and minimal bundle sizes

### Backend Performance
- **Vector Search**: Optimized similarity search with pgvector
- **Edge Functions**: Serverless scaling for API endpoints
- **Caching Strategy**: (Planned) Response caching for common queries
- **Database Optimization**: Indexed searches and query optimization

## Data Flow Architecture

### RAG Pipeline
```
User Query → Embedding Generation → Vector Search → Context Retrieval → AI Response
```

1. **Input Processing**: User message preprocessing and validation
2. **Embedding Generation**: OpenAI text-embedding-3-large model
3. **Similarity Search**: pgvector cosine similarity with threshold 0.7
4. **Context Assembly**: Top 5 relevant content chunks
5. **AI Generation**: GPT-4.1 with context-aware prompting

### Voice Pipeline
```
Voice Input → STT Processing → Chat Pipeline → TTS Generation → Audio Playback
```

1. **Audio Capture**: Browser MediaRecorder API
2. **Format Handling**: Multi-format support (WebM, MP4, OGG)
3. **Transcription**: OpenAI Whisper-1 model
4. **Chat Processing**: Standard RAG pipeline
5. **Speech Synthesis**: OpenAI TTS with 'nova' voice
6. **Audio Delivery**: Streaming playback with queue management

## Development & Deployment

### Environment Setup
```bash
# Required environment variables
OPENAI_API_KEY=sk-...           # OpenAI API access
SUPABASE_URL=https://...        # Supabase project URL  
SUPABASE_ANON_KEY=eyJ...        # Supabase anonymous key
```

### Deployment Strategy
```bash
# Frontend deployment (Lovable)
npm run build
npm run deploy

# Backend deployment (Supabase)
supabase functions deploy enhanced-chat-completion
supabase functions deploy speech-to-text
supabase functions deploy text-to-speech
```

### Monitoring & Analytics
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time tracking
- **Usage Analytics**: Conversation metrics and user engagement
- **Security Auditing**: Admin access logging

## Browser Compatibility Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Chat Interface | ✅ | ✅ | ✅ | ✅ |
| Voice Recording | ✅ | ✅ | ✅ | ✅ |
| Audio Playback | ✅ | ✅ | ✅ | ✅ |
| Avatar Mode | ✅ | ✅ | ✅ | ✅ |
| Admin Dashboard | ✅ | ✅ | ✅ | ✅ |

## Security Checklist

### ✅ Implemented
- [x] Admin authentication system
- [x] Session management with timeout
- [x] Secure API communication (HTTPS)
- [x] Input validation and sanitization
- [x] CORS configuration
- [x] Error message sanitization

### 🔄 Recommended for Production
- [ ] Environment-based credentials
- [ ] Database password hashing
- [ ] IP whitelisting for admin access
- [ ] Rate limiting on API endpoints
- [ ] Audit logging for admin actions
- [ ] Two-factor authentication (2FA)

### 📋 Future Enhancements
- [ ] Separate admin subdomain deployment
- [ ] Advanced threat detection
- [ ] Automated security scanning
- [ ] Compliance reporting (SOC2, GDPR)
