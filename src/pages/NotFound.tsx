/**
 * Not Found Page Component
 * This component is rendered when a user navigates to a URL that does not match
 * any defined routes in the application. It provides a user-friendly 404 error message
 * and typically offers navigation options back to the main parts of the application.
 */

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

/**
 * NotFound Component
 * Renders a 404 error page with:
 * - Error message
 * - Return to home link
 * - Error logging for debugging
 * 
 * @returns {JSX.Element} The 404 page component
 */
const NotFound = () => {
  // Get current location for error logging
  const location = useLocation();

  // Log 404 errors to console for debugging
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        {/* Error code */}
        <h1 className="text-4xl font-bold mb-4">404</h1>
        {/* Error message */}
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        {/* Navigation link */}
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
