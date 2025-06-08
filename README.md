# BIC AI Advisor Bot

## 🚀 Project Overview

The BIC AI Advisor Bot is an advanced, interactive chat interface designed to provide strategic insights and mentorship from Bibhrajit Halder, a distinguished founder with extensive expertise in AI, robotics, and autonomy. This intelligent platform serves as a resource for early-stage founders seeking guidance on capital raising, company scaling, and navigating the deep-tech landscape. Built with modern web technologies, the bot leverages secure AI integration via Supabase Edge Functions to deliver real-time, expert advice.

## ✨ Key Features

-   **AI-Powered Responses**: Engage in natural, conversational interactions powered by state-of-the-art OpenAI models.
-   **Expert Guidance**: Receive strategic business advice and mentorship informed by decades of founder experience in AI, robotics, and autonomy.
-   **Secure Integration**: Utilizes Supabase Edge Functions to securely manage API keys, ensuring robust data protection and scalable performance.
-   **Real-time Interaction**: Provides immediate, streamed responses for a fluid and dynamic chat experience.
-   **Embeddable Widget**: Designed for easy integration as a discreet widget into any web platform, such as Framer.

## 🛠️ Technology Stack

The application is built on a robust and scalable technology stack:

-   **Frontend**: React (with Vite for development)
-   **Styling**: Tailwind CSS, PostCSS, Shadcn UI (built on Radix UI)
-   **Data Management**: React Query
-   **Routing**: React Router DOM
-   **Language**: TypeScript
-   **Package Manager**: Bun
-   **Backend/BaaS**: Supabase (Database, Authentication, Edge Functions)
-   **AI**: OpenAI API
-   **Deployment**: Vercel

For a more detailed breakdown of the architecture and component interconnections, please refer to the `documentation.md` file.

## ⚙️ Getting Started

To set up and run the BIC AI Advisor Bot locally, follow these steps:

### Prerequisites

Ensure you have the following installed on your machine:

-   **Node.js**: Version 18 or higher (LTS recommended)
-   **Bun**: Install via `curl -fsSL https://bun.sh/install | bash` (macOS/Linux/WSL) or `powershell -c "irm bun.sh/install.ps1|iex"` (Windows PowerShell).
-   **Git**: For cloning the repository.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone [repository_url] # Replace with your actual repository URL
    cd BIC
    ```
2.  **Install dependencies** using Bun:
    ```bash
    bun install
    ```

### Configuration (Supabase & OpenAI)

The application communicates with OpenAI via a Supabase Edge Function to ensure secure handling of API keys. You must configure your Supabase project as follows:

1.  **Create a Supabase Project**: If you don't have one, create a project on the [Supabase Dashboard](https://app.supabase.com/).
2.  **Deploy the `chat-completion` Edge Function**: The source code for this function resides in your Supabase project (not this frontend repository) and acts as a proxy to OpenAI.
3.  **Configure `OPENAI_API_KEY` Secret**: Obtain a valid OpenAI API key from [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys). In your Supabase dashboard, navigate to "Edge Functions", select your `chat-completion` function, and add/update a secret named `OPENAI_API_KEY` with your OpenAI key.

For detailed instructions on setting up Supabase, refer to `documentation.md`.

### Running Locally

Once dependencies are installed and Supabase is configured, run the development server:

```bash
bun run dev
```

The application will typically be accessible at `http://localhost:5173`.

## 🌐 Deployment

This application is set up for continuous deployment on Vercel. Pushing changes to the main branch of your connected Git repository will automatically trigger a new deployment.

### Embedding the Widget

To embed the deployed chatbot as a fixed widget on another web platform (e.g., Framer), use the following `<iframe>` HTML code within the target platform's custom code section (e.g., "End of `<body>` tag"):

```html
<iframe src="https://my-chatbot-sigma-eight.vercel.app"
        style="position: fixed; bottom: 20px; right: 20px; width: 350px; height: 500px; border: none; z-index: 1000;"
        frameborder="0">
</iframe>
```

Replace `https://my-chatbot-sigma-eight.vercel.app` with your actual Vercel deployment URL. Adjust `width`, `height`, `bottom`, and `right` values in the `style` attribute as needed for your design.

## 📧 Support

For any inquiries, technical support, or further assistance, please contact us at `info@bicorp.ai`.

---
_This README provides a high-level overview. For in-depth technical details, architecture, and advanced troubleshooting, please consult `documentation.md`._


‪‪❤︎‬ BIC Team
