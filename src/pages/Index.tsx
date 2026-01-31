import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { GISMap } from '@/components/GISMap';
import { UploadInterface } from '@/components/UploadInterface';
import { AIImageProcessor } from '@/components/AIImageProcessor';

const Index = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'map' | 'upload' | 'analytics' | 'ai-processor'>('dashboard');

  const handleViewChange = (view: string) => {
    if (view === 'dashboard' || view === 'map' || view === 'upload' || view === 'analytics' || view === 'ai-processor') {
      setCurrentView(view);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'map':
        return (
          <div className="h-screen flex flex-col">
            <Navigation currentView={currentView} onViewChange={handleViewChange} />
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
        renderCurrentView()
      ) : (
        <div>
          <Navigation currentView={currentView} onViewChange={handleViewChange} />
          <div className="container mx-auto p-6">
            {renderCurrentView()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
