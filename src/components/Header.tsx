import { Moon, Sun, Activity, Database } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export const Header = () => {
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Default to dark mode
    if (!document.documentElement.classList.contains('light')) {
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('light');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Energie-Controlling</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Hausenergie-Management</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link to="/daten">
              <Button
                variant={location.pathname === '/daten' ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Datenverwaltung</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
