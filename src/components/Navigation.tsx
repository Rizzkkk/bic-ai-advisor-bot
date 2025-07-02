
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Home } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-4 left-4 z-50">
      <div className="flex gap-2">
        <Button
          variant={location.pathname === '/' ? 'default' : 'outline'}
          size="sm"
          asChild
        >
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </Button>
        <Button
          variant={location.pathname === '/admin' ? 'default' : 'outline'}
          size="sm"
          asChild
        >
          <Link to="/admin">
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
