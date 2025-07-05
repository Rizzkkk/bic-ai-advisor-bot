
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
      // Updated admin credentials
      const ADMIN_USERNAME = 'admin';
      const ADMIN_PASSWORD = 'BIC2025@Admin';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Secure Admin Access</CardTitle>
          <p className="text-gray-600 mt-2">Bibhrajit AI Avatar Dashboard</p>
          <div className="mt-3 px-4 py-2 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">Production Environment</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  disabled={isLoading}
                  className="h-11 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-2"
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
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" 
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 space-y-1">
            <p className="font-medium">🔒 Authorized Personnel Only</p>
            <p>Session expires after 2 hours of inactivity</p>
            <p className="text-xs bg-gray-50 p-2 rounded">Production Admin Portal v2.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
