# BIC AI Chatbot

An embeddable AI chatbot widget for BIC (Bibhrajit Investment Corporation) that provides intelligent conversations about AI startups, fundraising, and venture services. Built with Next.js frontend and designed for seamless integration into any website.

## 🚀 Features

- **Embeddable Chat Widget** - Seamless integration into existing websites
- **Real-Time AI Chat** - Powered by OpenAI GPT-4 for intelligent conversations
- **Lead Capture** - Smart lead detection and capture system
- **Service Integration** - Direct service offerings with Stripe payment integration
- **Session Management** - Persistent chat sessions across page reloads
- **Responsive Design** - Works perfectly on desktop and mobile devices
- **Brand Customization** - Styled specifically for BIC's brand identity

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **AI**: OpenAI GPT-4 Turbo
- **Styling**: Tailwind CSS with custom BIC branding
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
bic-chatbot/
├── public/
│   ├── bic-logo.png          # BIC brand logo
│   ├── favicon.ico           # Site favicon
│   ├── placeholder.svg       # Placeholder assets
│   └── robots.txt           # Search engine directives
├── src/
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── pages/              # Next.js pages
│   └── utils/              # Helper functions
├── App.css                 # Global styles
├── App.tsx                 # Main app component
├── index.css               # Base CSS styles
├── main.tsx               # Application entry point
└── vite-env.d.ts          # TypeScript definitions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/bic-chatbot.git
   cd bic-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key_here
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### OpenAI Setup
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env.local` file
3. Configure the system prompt in `src/lib/openai.ts`

### Stripe Integration
1. Create a Stripe account
2. Get your publishable key from the Stripe dashboard
3. Set up your service products and pricing
4. Add webhook endpoints for payment confirmations

### Brand Customization
- Update `public/bic-logo.png` with your logo
- Modify colors in `tailwind.config.ts`
- Customize fonts in `src/styles/globals.css`

## 📦 Embedding the Widget

### Basic Embed (Recommended)
```html
<!-- Add to your website's <head> -->
<script src="https://your-domain.com/widget.js"></script>

<!-- Add anywhere in your <body> -->
<div id="bic-chatbot"></div>
<script>
  BICChatbot.init({
    container: 'bic-chatbot',
    apiBase: 'https://your-api-domain.com'
  });
</script>
```

### Advanced Configuration
```javascript
BICChatbot.init({
  container: 'bic-chatbot',
  apiBase: 'https://your-api-domain.com',
  theme: {
    primaryColor: '#2563eb',
    fontFamily: 'Poppins, sans-serif'
  },
  welcomeMessage: 'Hi! I\'m Bibhrajit. How can I help with your startup?',
  position: 'bottom-right' // bottom-left, top-right, top-left
});
```

## 🎨 Customization

### Colors
Update your brand colors in `tailwind.config.ts`:
```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        'bic-primary': '#your-primary-color',
        'bic-secondary': '#your-secondary-color',
      }
    }
  }
}
```

### Typography
The chatbot uses:
- **Headlines**: Poppins (sans-serif)
- **Body Text**: PT Sans (sans-serif)

Update fonts in `src/styles/globals.css`

## 🔌 API Integration

### Chat Endpoint
```typescript
POST /api/chat
{
  "message": "Tell me about pitch deck services",
  "sessionId": "optional-session-id",
  "userEmail": "optional-email@example.com"
}
```

### Response Format
```typescript
{
  "response": "AI generated response",
  "sessionId": "session-identifier", 
  "services": [
    {
      "name": "Pitch Deck Review",
      "price": 699,
      "stripeId": "price_xxx"
    }
  ],
  "isLead": true
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
- **Netlify**: Supports Next.js with additional configuration
- **Railway**: Good for full-stack applications
- **Heroku**: Traditional deployment option

## 📊 Analytics & Monitoring

The chatbot includes built-in analytics for:
- Chat volume and engagement
- Lead capture rates
- Service conversion tracking
- User behavior patterns

Access analytics through the admin dashboard at `/admin`

## 🔒 Security Features

- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Sanitizes all user inputs
- **CORS Protection**: Configured for specific domains
- **API Key Security**: Server-side API key management
- **Session Security**: Secure session handling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical support or questions:
- **Email**: info@bicorp.ai
- **Documentation**: [docs.bicorp.ai](https://docs.bicorp.ai)
- **Issues**: [GitHub Issues](https://github.com/your-username/bic-chatbot/issues)

## 🏗️ Roadmap

- [ ] Multi-language support
- [ ] Voice chat integration
- [ ] Advanced analytics dashboard
- [ ] A/B testing for responses
- [ ] Integration with CRM systems
- [ ] Mobile app version

---

**Built with ❤️ by BIC Team**
