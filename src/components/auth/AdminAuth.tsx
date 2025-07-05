
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface AdminAuthProps {
  onAuthenticated: () => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session');
    const sessionExpiry = localStorage.getItem('admin_session_expiry');
    
    if (adminSession && sessionExpiry) {
      const now = new Date().getTime();
      const expiry = parseInt(sessionExpiry);
      
      if (now < expiry) {
        onAuthenticated();
      } else {
        // Clear expired session
        localStorage.removeItem('admin_session');
        localStorage.removeItem('admin_session_expiry');
      }
    }
  }, [onAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate authentication - in production, this should call a secure API
      // For now, using hardcoded credentials (should be moved to environment variables)
      const ADMIN_USERNAME = 'admin';
      const ADMIN_PASSWORD = 'BIC2024@Admin';

      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Create session (expires in 2 hours)
        const sessionToken = btoa(`${username}:${Date.now()}`);
        const expiryTime = new Date().getTime() + (2 * 60 * 60 * 1000); // 2 hours
        
        localStorage.setItem('admin_session', sessionToken);
        localStorage.setItem('admin_session_expiry', expiryTime.toString());
        
        onAuthenticated();
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <p className="text-gray-600">Bibhrajit AI Avatar Dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Authorized Personnel Only</p>
            <p>Session expires after 2 hours of inactivity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
