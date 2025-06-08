/**
 * Main Application Component
 * Sets up the core application structure with routing, state management,
 * and global UI providers.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          {/* 404 page for unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
