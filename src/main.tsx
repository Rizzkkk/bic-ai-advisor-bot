/**
 * Application Entry Point
 * This file is the primary entry point for the React application.
 * It is responsible for rendering the main `App` component into the DOM,
 * making the application visible and interactive in the browser.
 * It also imports the global CSS styles needed for the application's basic layout and appearance.
 */

// Main entry point for the React application
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />)
