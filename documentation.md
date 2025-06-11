# Project Documentation: BIC Chatbot

## 1. Project Overview

The BIC Chatbot is a web-based application designed to provide an interactive chat interface. It acts as a digital assistant for Bibhrajit Investment Corporation (BIC), a firm specializing in venture and advisory services for early-stage AI, robotics, autonomy, and defense tech startups. The chatbot aims to help founders with queries related to raising capital and scaling their companies, providing insights from an experienced founder's perspective. The application is built using React and communicates with OpenAI's API through a Supabase Edge Function for secure and scalable AI responses.

## 2. Architecture

The application follows a client-server architecture. The frontend, built with React, runs in the user's browser. It communicates with a backend Supabase Edge Function, which in turn interacts with the OpenAI API. This setup ensures that sensitive API keys are never exposed on the client side.

-   **Frontend (React)**: Manages the user interface, chat state, and sends/receives messages.
-   **Supabase Edge Function**: Acts as a secure intermediary between the frontend and OpenAI. It handles authentication and forwards requests, preventing direct client-side access to the OpenAI API key.
-   **OpenAI API**: Provides the large language model capabilities that power the chatbot's responses.

## 3. Technology Stack

The BIC Chatbot application leverages a modern web development stack to deliver a robust and efficient user experience.

-   **Frontend Framework**: React (with Vite for fast development setup and bundling)
-   **Styling**: Tailwind CSS for utility-first styling, integrated with PostCSS.
-   **UI Components**: Shadcn UI components built on top of Radix UI for accessible and customizable UI elements.
-   **State Management/Data Fetching**: React Query for powerful data fetching, caching, and synchronization.
-   **Routing**: React Router DOM for client-side navigation.
-   **Type Checking**: TypeScript for improved code quality, maintainability, and early error detection.
-   **Package Manager**: Bun for fast dependency installation and script execution.
-   **Backend/BaaS (Backend-as-a-Service)**: Supabase for database, authentication, and Edge Functions.
-   **AI Integration**: OpenAI API for large language model capabilities.
-   **Deployment**: Vercel for continuous deployment and hosting of the frontend application.

## 4. Core Components and File Interconnections

The `src` directory contains the core logic and components of the application.

### `src/main.tsx`

This file is the primary entry point of the React application. Its main responsibility is to render the root React component, `App`, into the DOM. It also imports the global CSS styles from `index.css`.

### `src/App.tsx`

The `App` component serves as the root component for the entire application. It establishes the foundational structure and provides essential contexts:

-   **React Query**: Manages data fetching, caching, and synchronization for the application.
-   **TooltipProvider**: Provides context for UI tooltips used throughout the application.
-   **Toast Notifications**: Integrates two types of toast notifications (`Toaster` and `Sonner`) for displaying ephemeral messages to the user.
-   **React Router (`react-router-dom`)**: Handles client-side routing, defining the navigation paths within the application. Currently, it sets up a route for the main landing page (`/`) which renders the `Index` component, and a catch-all `*` route for unmatched paths that renders a `NotFound` component.

### `src/pages/Index.tsx`

This component represents the main landing page of the application. Its sole purpose is to render the `BICChatbot` component. This means that when a user navigates to the root URL (`/`), they will see the chatbot interface.

### `src/components/BICChatbot.tsx`

This is the central component for the chatbot's functionality and user interface. It manages the entire chat experience, including:

-   **State Management**: It maintains various states such as whether the chat window is open, minimized, the list of messages exchanged, loading indicators, and typing status.
-   **Message Handling**: It handles sending user messages, adding them to the chat history, and processing the AI's responses.
-   **API Integration**: It interacts with the `OpenAIService` to send messages to the AI and receive streamed responses.
-   **UI Orchestration**: It orchestrates the display of sub-components like `ChatBubble` (the floating button) and `ChatWindow` (the main chat interface), passing necessary props to them.
-   **Welcome Message**: Displays an initial welcome message when the chat is first opened.
-   **Error Handling**: Catches errors during API communication and displays a user-friendly error message.

This component imports `OpenAIService` from `src/utils/openaiService.ts` and UI components like `ChatBubble`, `ChatWindow`, and `Message` types from `src/components/chat/types.ts`.

### `src/utils/openaiService.ts`

This service acts as the communication layer with the OpenAI API. Critically, it **does not directly expose the OpenAI API key**. Instead, it uses the Supabase JavaScript client (`@supabase/supabase-js`) to invoke a Supabase Edge Function (`chat-completion`).

-   **Secure API Calls**: All requests to OpenAI are proxied through the Supabase Edge Function, ensuring that the sensitive OpenAI API key is securely managed on the server-side within the Supabase environment variables.
-   **Streaming Responses**: The `sendMessageStream` method is designed to handle streaming responses from OpenAI, providing real-time updates to the UI as the AI generates text. It makes a `fetch` request directly to the Supabase Edge Function URL.
-   **System Prompt**: It defines the `createSystemPrompt` function, which sets the personality, expertise, and specific response rules for the AI assistant, ensuring consistent and branded communication. This prompt can be modified to adjust the chatbot's persona and response style.

This file imports the `supabase` client from `src/integrations/supabase/client.ts`.

### `src/integrations/supabase/client.ts`

This file is automatically generated by Supabase CLI commands and contains the client-side configuration for Supabase. It initializes the Supabase client using the project URL and public key. This client is then used by `OpenAIService` to invoke Edge Functions. **It is crucial not to manually edit this file.** Any changes to your Supabase project settings (like project URL or public key) should be updated via the Supabase CLI or dashboard, which will regenerate this file.

### `src/components/chat/` (Directory)

This directory contains sub-components that make up the visual elements of the chatbot, including:

-   `ChatBubble.tsx`: The floating icon or button that opens the chat window.
-   `ChatWindow.tsx`: The main chat interface, including message display, input field, and suggested questions.
-   `types.ts`: Defines TypeScript interfaces and types used by the chat components, such as `Message` and `BICChatbotProps`, ensuring type safety and consistency across the chat-related components.

## 5. Local Development Setup

To set up and run the BIC Chatbot application locally, follow these steps:

### 5.1 Prerequisites

Ensure you have the following installed on your machine:

-   **Node.js**: Version 18 or higher (LTS recommended).
-   **Bun**: The JavaScript runtime and package manager. Install it using `curl -fsSL https://bun.sh/install | bash` (macOS/Linux/WSL) or `powershell -c "irm bun.sh/install.ps1|iex"` (Windows PowerShell).
-   **Git**: For cloning the repository.

### 5.2 Installation Steps

1.  **Clone the Repository**:
    ```bash
    git clone [repository_url]
    cd BIC
    ```
    (Replace `[repository_url]` with the actual Git repository URL if you don't have it already.)

2.  **Install Dependencies**:
    The project uses Bun as its package manager.
    ```bash
    bun install
    ```
    This command will install all necessary project dependencies as listed in `package.json`.

3.  **Environment Variables (Supabase & OpenAI)**:
    While the client-side code doesn't directly use an `.env` file for the OpenAI key, your Supabase project needs to be correctly configured. Refer to Section 6: Supabase Setup for details on configuring your Supabase Edge Function.

4.  **Run the Development Server**:
    ```bash
    bun run dev
    ```
    This will start the development server, typically accessible at `http://localhost:5173` (or another port if 5173 is in use). The application will automatically reload on code changes.

## 6. Supabase Setup

The `chat-completion` Edge Function in your Supabase project is critical for the chatbot's functionality, as it securely handles the interaction with the OpenAI API.

### 6.1 Create Supabase Project & Edge Function

1.  **Create a Supabase Project**: If you haven't already, create a new project on the [Supabase Dashboard](https://app.supabase.com/).
2.  **Create `chat-completion` Edge Function**:
    *   In your Supabase project dashboard, navigate to "Edge Functions".
    *   Create a new function named `chat-completion`.
    *   The code for this function should handle incoming requests from your frontend, make a secure call to the OpenAI API using the `OPENAI_API_KEY` secret, and stream back the response. (The exact code for the Edge Function is not part of this client-side repository but is crucial for the backend logic.)

### 6.2 Configure `OPENAI_API_KEY` Secret

The `OPENAI_API_KEY` must be configured as a secret within your Supabase project's Edge Function. This ensures that the key is never exposed in your client-side application.

1.  **Obtain OpenAI API Key**: Get a valid API key from your [OpenAI API Keys page](https://platform.openai.com/account/api-keys). It should start with `sk-proj-`.
2.  **Add/Update Secret in Supabase**:
    *   In your Supabase project dashboard, go to "Edge Functions".
    *   Select your `chat-completion` function.
    *   Find the "Environment Variables" or "Secrets" section.
    *   Add a new secret (or update the existing one) with the name `OPENAI_API_KEY` and paste your OpenAI key as its value. Ensure there are no extra spaces or characters.

## 7. How the Application Runs

This section details the operational flow of the BIC Chatbot from user interaction to AI response:

1.  **Application Initialization (`src/main.tsx`)**: The web application starts by rendering the primary `App` component into the browser's Document Object Model (DOM).
2.  **Global Setup (`src/App.tsx`)**: The `App` component establishes the application's foundational services and contexts, including:
    *   **React Query**: Sets up a client for efficient data fetching and caching.
    *   **UI Providers**: Initializes components for tooltips and various toast notifications to enhance user feedback.
    *   **Routing**: Configures client-side routing, directing users to the main `Index` page upon navigating to the root URL.
3.  **Chatbot Display (`src/pages/Index.tsx` -> `src/components/BICChatbot.tsx`)**: The `Index` page, acting as the main landing view, integrates and renders the `BICChatbot` component, making the interactive chat interface visible to the user.
4.  **User Interaction (`BICChatbot.tsx`)**: When a user types a message into the chatbot's input field and sends it:
    *   The user's message is immediately added to the local chat history displayed within the `BICChatbot` component.
    *   The `BICChatbot` component then initiates a request to the `OpenAIService` to process the message.
5.  **API Call Initiation (`src/utils/openaiService.ts` -> Supabase Edge Function)**:
    *   The `OpenAIService` prepares the request, including the current chat history (for conversational context) and specific OpenAI model parameters (e.g., `model`, `temperature`, `maxTokens`).
    *   Crucially, `OpenAIService` does not make a direct call to OpenAI. Instead, it securely invokes the `chat-completion` Supabase Edge Function using the `@supabase/supabase-js` client.
6.  **Supabase Edge Function Processing (Server-Side)**:
    *   The `chat-completion` Edge Function, hosted on Supabase, receives the incoming request.
    *   Within this secure serverless environment, the Edge Function accesses the `OPENAI_API_KEY` (which is stored as a secret in the Supabase dashboard and never exposed to the client).
    *   The Edge Function then makes the actual API call to OpenAI, leveraging the large language model to generate a response.
    *   For efficiency and better user experience, the Edge Function is configured to stream the OpenAI response back to the `OpenAIService` as it's generated.
7.  **Streaming Response Handling (`src/utils/openaiService.ts` -> `BICChatbot.tsx`)**:
    *   `OpenAIService` receives continuous data chunks from the Supabase Edge Function's stream.
    *   These chunks are progressively passed back to the `BICChatbot` component via a callback function.
    *   The `BICChatbot` updates its internal state with each new chunk, creating a "typing" effect and displaying the AI's response in real-time as it arrives.
8.  **Display Final Response (`BICChatbot.tsx` -> Chat UI Components)**: Once all chunks have been received and the complete AI response is assembled, the `BICChatbot` adds the final message to the chat history, and the relevant UI components (like `ChatBubble` and `ChatWindow`) ensure it's fully rendered to the user.

## 8. Deployment and Embedding

### 8.1 Vercel Deployment

The application is configured for continuous deployment on Vercel. Any push to the main branch of the connected Git repository will automatically trigger a new deployment.

### 8.2 Embedding in Framer (or other platforms)

The deployed application can be seamlessly embedded into other web platforms, such as Framer, using an HTML `<iframe>` tag. This allows the chatbot to function as a fixed widget without interfering with the parent site's layout.

To embed the Vercel-deployed application into a Framer project, the following HTML `<iframe>` code is placed within the "End of <body> tag" section of Framer's "Custom Code" settings:

```html
<iframe src="https://my-chatbot-sigma-eight.vercel.app"
        style="position: fixed; bottom: 20px; right: 20px; width: 350px; height: 500px; border: none; z-index: 1000;"
        frameborder="0">
</iframe>
```

-   **`src="https://my-chatbot-sigma-eight.vercel.app"`**: This is the URL of your deployed application on Vercel. Ensure this is the correct and most stable domain (e.g., from the "Domains" section in Vercel).
-   **`style="..."`**: This inline CSS ensures the widget is positioned in the bottom-right corner, has a defined size, no border, and appears above other content.
    -   `position: fixed;`: Keeps the widget in the same position relative to the browser window, even when scrolling.
    -   `bottom: 20px; right: 20px;`: Sets the distance from the bottom and right edges of the viewport. These values can be adjusted to fit your specific design needs.
    -   `width: 350px; height: 500px;`: Defines the dimensions of the chatbot widget. Adjust these values as required for optimal display.
    -   `border: none;`: Removes the default iframe border, making it blend more seamlessly with the parent page.
    -   `z-index: 1000;`: Controls the stacking order, ensuring the chatbot widget appears on top of most other page elements. This value might need adjustment if there are conflicting `z-index` values on the host page.
-   **`frameborder="0"`**: A deprecated HTML attribute (but still widely supported) to remove the iframe's border. The `border: none;` in the `style` attribute provides the same effect.

## 9. Dark Mode & Transparency Handling

To ensure the chat widget always appears with a transparent background and a white chatbox—regardless of the user's device, browser, or system dark mode setting—the following approach is used:

- All relevant containers (`html`, `body`, `#root`, `.app`, `.main-container`, `.chat-widget-container`) are forced to use `color-scheme: light` and have their backgrounds set to `transparent`.
- The chat window itself (`.chat-window`, `.embedded-chat-window`) is always white with dark text.
- No dark mode CSS classes or logic are applied to the widget.

**Key CSS:**
```css
html, body, #root, .app, .main-container, .chat-widget-container {
  color-scheme: light !important;
  background: transparent !important;
  background-color: transparent !important;
}

.chat-window, .embedded-chat-window {
  background: rgba(255, 255, 255, 0.98) !important;
  color: #222 !important;
}
```

This ensures the chat widget remains visually consistent and readable in all themes and browsers, and prevents unwanted black backgrounds in dark mode.

## 10. Troubleshooting

This section outlines common issues and their potential solutions.

### 10.1 "Incorrect API key provided" or "Supabase function error: 500 - OpenAI API error: 401"

**Cause**: The OpenAI API key configured in your Supabase project's Edge Function is invalid, expired, or malformed.

**Solution**:
1.  Go to your [OpenAI API Keys page](https://platform.openai.com/account/api-keys).
2.  Generate a **new secret key**. Copy the entire key (it starts with `sk-proj-`).
3.  Navigate to your Supabase project dashboard -> "Edge Functions" -> select your `chat-completion` function.
4.  In the "Environment Variables" or "Secrets" section, delete the existing `OPENAI_API_KEY` entry.
5.  Add a new secret with the name `OPENAI_API_KEY` and paste the newly generated key as its value. Ensure there are no extra spaces or characters before or after the key.
6.  The changes should take effect immediately. Try sending a message in the chatbot again.

### 10.2 "Bun command not found"

**Cause**: Bun is not installed on your system or is not correctly added to your system's PATH.

**Solution**:
1.  **Install Bun**: Follow the installation instructions provided in Section 5.1 Prerequisites.
    *   For Windows PowerShell: `powershell -c "irm bun.sh/install.ps1|iex"`
    *   For macOS/Linux/WSL: `curl -fsSL https://bun.sh/install | bash`
2.  **Restart Terminal**: After installation, restart your terminal or editor to ensure the PATH changes are applied.
3.  **Verify Installation**: Run `bun --version` to confirm Bun is installed and accessible.

### 10.3 Dependencies Not Installing Correctly

**Cause**: Issues during the `bun install` process.

**Solution**:
1.  **Clear Bun Cache**: Sometimes, clearing the cache can resolve installation issues.
    ```bash
    bun clean
    ```
2.  **Re-install Dependencies**:
    ```bash
    bun install
    ```
3.  **Check Network**: Ensure you have a stable internet connection, as Bun needs to download packages from npm.

## 11. Support

For any further assistance or issues not covered in this documentation, please reach out to:

[Contact Email or Support Channel (e.g., info@bicorp.ai)]

---
_This documentation was generated on [Current Date] and reflects the project's state as of its last update._ 