# BIC AI Advisor Bot - Technical Overview

## Project Setup

### GitHub Integration
- The project is hosted on GitHub, which serves as our version control system
- This allows us to track changes, collaborate, and maintain different versions of the chatbot
- The repository is private and secure, ensuring your intellectual property is protected

### File Structure
The project is organized into clear, logical sections:
- `src/` - Contains all the main application code
  - `components/` - Reusable parts of the chatbot interface
  - `pages/` - Different views of the application
  - `utils/` - Helper functions and services
  - `integrations/` - Connections to external services

### The Backend
- We use Supabase as our backend service provider
- This provides a secure, scalable infrastructure for the chatbot
- All sensitive data (like API keys) are stored securely on Supabase's servers
- The backend handles user authentication and data management

## OpenAI Integration

### API Key Management
- The OpenAI API key is stored securely in Supabase's environment variables
- This means the key is never exposed in the frontend code
- Only authorized backend services can access the API key
- This setup ensures maximum security for your API credentials

### Connection to OpenAI
- When a user sends a message, it goes through our secure backend
- The backend then communicates with OpenAI's servers
- This creates a safe "tunnel" for all AI interactions
- The system uses GPT-4 for high-quality, context-aware responses

### Response Generation
- The chatbot maintains conversation history for context
- Each message is processed with specific guidelines (system prompt)
- Responses are streamed in real-time for a natural feel
- The system includes error handling for reliable operation

## Training Data / Chatbot Info

### Custom Data Integration
- The chatbot's personality and knowledge are defined in a system prompt
- This prompt is stored in `src/utils/openaiService.ts`
- It includes:
  - Company information and expertise areas
  - Service offerings and pricing
  - Response guidelines and tone
  - Specific URLs and contact information

### Response Influence
- The system prompt guides how the AI responds
- It ensures consistent branding and messaging
- Maintains professional tone while being conversational
- Includes specific rules for handling different types of queries

### Special Formatting
- The chatbot is designed to provide concise, actionable responses
- Responses are limited to 2-4 paragraphs maximum
- Uses natural, conversational language
- Includes relevant links when discussing services or booking

## How It Works (Simplified)

### User Interaction Flow
1. User opens the chatbot (appears as a chat bubble)
2. User types and sends a message
3. Message is sent to our secure backend
4. Backend processes the message and sends it to OpenAI
5. AI generates a response based on the conversation history and guidelines
6. Response is streamed back to the user in real-time
7. The conversation continues with full context maintained

### Technical Components
- Frontend: React application with modern UI components
- Backend: Supabase Edge Functions for secure processing
- AI: OpenAI's GPT-4 model for intelligent responses
- Security: All sensitive data is encrypted and securely stored

## For Future Editing

### Updating Chatbot Content
- To modify the chatbot's personality or responses:
  1. Navigate to `src/utils/openaiService.ts`
  2. Find the `createSystemPrompt` function
  3. Update the relevant sections (company info, services, etc.)
  4. Deploy the changes through our standard process

### Managing API Credentials
- API keys are managed through the Supabase dashboard
- To update the OpenAI API key:
  1. Log into the Supabase dashboard
  2. Go to Edge Functions
  3. Select the `chat-completion` function
  4. Update the `OPENAI_API_KEY` secret

### Testing and Debugging
- Test the chatbot through the development environment:
  1. Run `bun run dev` locally
  2. Access the chatbot at `http://localhost:5173`
  3. Use the browser's developer tools to monitor responses
  4. Check the console for any error messages

## Support and Maintenance

### Technical Support
- For technical issues, contact: info@bicorp.ai
- Our team monitors the system 24/7
- Regular updates and maintenance are performed automatically
- Performance metrics are tracked for optimal operation

### Regular Updates
- The system is regularly updated for:
  - Security patches
  - Performance improvements
  - New features
  - Bug fixes
- All updates are tested thoroughly before deployment

---

This documentation is designed to be a living document and will be updated as the system evolves. For the most current information, please refer to the `documentation.md` file in the repository. 