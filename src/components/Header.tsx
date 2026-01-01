import { Moon, Sun, Activity, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export const Header = () => {
  const [isDark, setIsDark] = useState(true);

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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Energie-Controlling</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Hausenergie-Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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
