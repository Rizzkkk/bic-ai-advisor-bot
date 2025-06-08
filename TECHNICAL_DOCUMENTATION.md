# Technical Documentation

## Overview
The BIC AI Advisor Bot is built using React and integrates with OpenAI's API to provide real-time AI-powered responses. The application is designed to be scalable, secure, and user-friendly.

## Architecture
- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **AI Integration**: OpenAI API

## Features
- Real-time chat interface
- AI-powered responses
- Secure API key management
- Responsive design

## Contact
For technical support, please contact info@bicorp.ai.

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── BICChatbot.tsx  # Main chatbot component
│   ├── ServiceButtons.tsx # Service selection buttons
│   └── ContactForm.tsx # Contact form component
├── pages/              # Page components
│   ├── Index.tsx       # Main landing page
│   └── NotFound.tsx    # 404 page
├── hooks/              # Custom React hooks
├── lib/               # Utility libraries
└── utils/             # Helper functions
```

## Core Components

### 1. BICChatbot Component (`BICChatbot.tsx`)
The main chatbot interface component that handles all chat interactions.

```typescript
// Key Features
- Real-time chat interface
- Message history management
- Service selection integration
- File attachment handling
- Typing indicators
- Message status tracking

// State Management
interface ChatState {
  messages: Message[];
  isTyping: boolean;
  selectedService: ServiceType;
  attachments: File[];
}

// Key Functions
- handleSendMessage(): Handles message sending
- handleFileUpload(): Manages file attachments
- handleServiceSelect(): Processes service selection
- handleTyping(): Manages typing indicators
```

### 2. ServiceButtons Component (`ServiceButtons.tsx`)
Handles the service selection interface and navigation.

```typescript
// Service Types
type ServiceType = 
  | 'investment'
  | 'gtm'
  | 'technical';

// Component Props
interface ServiceButtonsProps {
  onSelect: (service: ServiceType) => void;
  selectedService: ServiceType | null;
}

// Key Features
- Service category buttons
- Visual feedback for selection
- Smooth transitions
- Mobile responsiveness
```

### 3. ContactForm Component (`ContactForm.tsx`)
Manages the contact form and submission process.

```typescript
// Form Fields
interface ContactFormData {
  name: string;
  email: string;
  company: string;
  message: string;
  service: ServiceType;
}

// Validation Rules
- Email format validation
- Required field checking
- Message length limits
- Company name validation

// Submission Handling
- Form data processing
- API integration
- Success/error handling
- Loading states
```

## State Management

### 1. Chat State
```typescript
interface ChatState {
  messages: Message[];
  isTyping: boolean;
  selectedService: ServiceType | null;
  attachments: File[];
  error: string | null;
  loading: boolean;
}
```

### 2. Service State
```typescript
interface ServiceState {
  currentService: ServiceType | null;
  serviceHistory: ServiceType[];
  lastUpdated: Date;
}
```

### 3. User State
```typescript
interface UserState {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  preferences: UserPreferences;
}
```

## API Integration

### 1. Chat API
```typescript
interface ChatAPI {
  sendMessage(message: string): Promise<Message>;
  getHistory(): Promise<Message[]>;
  uploadFile(file: File): Promise<string>;
  selectService(service: ServiceType): Promise<void>;
}
```

### 2. Service API
```typescript
interface ServiceAPI {
  getServices(): Promise<Service[]>;
  getServiceDetails(id: string): Promise<ServiceDetails>;
  updateService(service: Service): Promise<void>;
}
```

## Event Handling

### 1. Message Events
```typescript
// Message sending
const handleSendMessage = async (message: string) => {
  try {
    setIsTyping(true);
    const response = await chatAPI.sendMessage(message);
    setMessages(prev => [...prev, response]);
  } catch (error) {
    handleError(error);
  } finally {
    setIsTyping(false);
  }
};
```

### 2. Service Selection
```typescript
// Service selection
const handleServiceSelect = async (service: ServiceType) => {
  try {
    setSelectedService(service);
    await serviceAPI.updateService(service);
    updateChatContext(service);
  } catch (error) {
    handleError(error);
  }
};
```

## Error Handling

### 1. Error Types
```typescript
type ErrorType = 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'API_ERROR'
  | 'AUTH_ERROR';

interface ErrorState {
  type: ErrorType;
  message: string;
  timestamp: Date;
}
```

### 2. Error Handling Functions
```typescript
const handleError = (error: Error) => {
  const errorState: ErrorState = {
    type: determineErrorType(error),
    message: error.message,
    timestamp: new Date()
  };
  setError(errorState);
  logError(errorState);
};
```

## Performance Optimizations

### 1. Message Rendering
```typescript
// Memoized message component
const Message = React.memo(({ message }: MessageProps) => {
  return (
    <div className="message">
      {/* Message content */}
    </div>
  );
});
```

### 2. Service Selection
```typescript
// Debounced service selection
const debouncedServiceSelect = useCallback(
  debounce((service: ServiceType) => {
    handleServiceSelect(service);
  }, 300),
  []
);
```

## Security Implementation

### 1. Authentication
```typescript
// Auth middleware
const authMiddleware = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

### 2. Data Encryption
```typescript
// Message encryption
const encryptMessage = (message: string): string => {
  return encrypt(message, ENCRYPTION_KEY);
};

// Message decryption
const decryptMessage = (encryptedMessage: string): string => {
  return decrypt(encryptedMessage, ENCRYPTION_KEY);
};
```

## Testing

### 1. Unit Tests
```typescript
describe('BICChatbot', () => {
  test('sends message correctly', async () => {
    // Test implementation
  });

  test('handles service selection', async () => {
    // Test implementation
  });
});
```

### 2. Integration Tests
```typescript
describe('Chat Integration', () => {
  test('complete chat flow', async () => {
    // Test implementation
  });
});
```

## Deployment

### 1. Build Process
```bash
# Production build
npm run build

# Development build
npm run dev
```

### 2. Environment Configuration
```typescript
interface EnvConfig {
  API_URL: string;
  ENCRYPTION_KEY: string;
  MAX_FILE_SIZE: number;
  SUPPORTED_FILE_TYPES: string[];
}
```

## Monitoring and Logging

### 1. Performance Monitoring
```typescript
const monitorPerformance = (metric: PerformanceMetric) => {
  logMetric(metric);
  alertIfThresholdExceeded(metric);
};
```

### 2. Error Logging
```typescript
const logError = (error: ErrorState) => {
  console.error(error);
  sendToErrorTracking(error);
};
``` 