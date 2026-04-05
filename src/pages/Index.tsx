import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { GISMap } from '@/components/GISMap';
import { UploadInterface } from '@/components/UploadInterface';
import { AIImageProcessor } from '@/components/AIImageProcessor';
import LoginPage from './Login';
import AdminDashboard from './AdminDashboard';
import SettingsPage from './Settings';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'map' | 'upload' | 'analytics' | 'ai-processor' | 'login' | 'admin' | 'settings'>('dashboard');

  const handleViewChange = (view: string) => {
    if (['dashboard', 'map', 'upload', 'analytics', 'ai-processor', 'login', 'admin', 'settings'].includes(view)) {
      setCurrentView(view as 'dashboard' | 'map' | 'upload' | 'analytics' | 'ai-processor' | 'login' | 'admin' | 'settings');
    }
  };

  // If user goes to login page
  if (currentView === 'login') {
    return (
      <LoginPage 
        onLoginSuccess={() => setCurrentView('dashboard')} 
      />
    );
  }

  // If user is on admin dashboard
  if (currentView === 'admin') {
    return (
      <AdminDashboard 
        onLogout={() => {
          setCurrentView('dashboard');
        }} 
      />
    );
  }

  // If user is on settings page
  if (currentView === 'settings') {
    return (
      <SettingsPage 
        onBack={() => setCurrentView('dashboard')} 
      />
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'map':
        return (
          <div className="h-screen flex flex-col">
            <Navigation currentView={currentView} onViewChange={handleViewChange} onAdminClick={() => setCurrentView('admin')} />
            <div className="flex-1">
              <GISMap />
            </div>
          </div>
        );
      case 'upload':
        return <UploadInterface onBack={() => setCurrentView('dashboard')} />;
      case 'ai-processor':
        return <AIImageProcessor />;
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Advanced Analytics Dashboard</h2>
              <p className="text-muted-foreground">
                Comprehensive analytics and reporting features coming soon...
              </p>
            </div>
          </div>
        );
      default:
        return <Dashboard onViewChange={handleViewChange} currentView={currentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'map' ? (
        <div className="h-screen flex flex-col">
          <Navigation 
            currentView={currentView} 
            onViewChange={handleViewChange} 
            onAdminClick={() => setCurrentView('admin')}
            onSettingsClick={() => setCurrentView('settings')}
          />
          <div className="flex-1">
            <GISMap />
          </div>
        </div>
      ) : (
};

export default Index;
