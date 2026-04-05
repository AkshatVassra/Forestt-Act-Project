import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Map, 
  Upload, 
  BarChart3, 
  Settings, 
  Bell,
  User,
  Zap,
  LogOut
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onAdminClick?: () => void;
  onSettingsClick?: () => void;
}

export const Navigation = ({ currentView, onViewChange, onAdminClick, onSettingsClick }: NavigationProps) => {
  const { user, logout } = useAuth();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'map', label: 'WebGIS Map', icon: Map },
    { id: 'upload', label: 'Upload Claims', icon: Upload },
    { id: 'ai-processor', label: 'AI Processor', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleAdminClick = () => {
    if (user && user.role === 'admin') {
      onAdminClick?.();
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-card border-b border-border shadow-panel sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-forest rounded-lg flex items-center justify-center">
              <Map className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">FRA WebGIS DSS</h1>
              <p className="text-xs text-muted-foreground">Forest Rights Authority</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "forest" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(item.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center bg-destructive">
                3
              </Badge>
            </Button>
            <Button 
              variant={currentView === 'settings' ? 'forest' : 'ghost'} 
              size="sm"
              onClick={onSettingsClick}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAdminClick}
                    className="bg-green-50 border-green-200 hover:bg-green-100"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">Admin</span>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewChange('login')}
              >
                <User className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
