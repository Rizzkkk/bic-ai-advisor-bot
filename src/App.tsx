
/**
 * Main Application Component
 * This file serves as the root component of the entire application.
 * It sets up global providers such as React Query for data management,
 * TooltipProvider for UI tooltips, and toast notification systems.
 * It also configures React Router for navigation within the single-page application.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ChatApplication from './ChatApplication';
import './App.css';

// Initialize React Query client for data fetching and caching
const queryClient = new QueryClient();

/**
 * App Component
 * Root component that provides:
 * - React Query for data management
 * - Tooltip context for UI tooltips
 * - Toast notifications (both standard and Sonner)
 * - React Router for navigation
 * 
 * @returns {JSX.Element} The root application component
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Global toast notifications */}
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main landing page */}
          <Route path="/" element={<Index />} />
          {/* Admin dashboard for AI Avatar management */}
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          {/* 404 page for unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
