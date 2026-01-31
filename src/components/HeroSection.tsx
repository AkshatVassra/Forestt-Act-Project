import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TreePine, 
  Satellite, 
  Brain, 
  FileText,
  Map,
  Upload
} from 'lucide-react';
import forestHero from '@/assets/forest-hero-bg.jpg';

interface HeroSectionProps {
  onViewChange: (view: string) => void;
}

export const HeroSection = ({ onViewChange }: HeroSectionProps) => {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-map mb-8">
      <div 
        className="relative h-80 bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url(${forestHero})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-overlay"></div>
        
        <div className="relative z-10 container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Hero Content */}
            <div className="text-white">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Government of India
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Forest Rights Act 2006
                </Badge>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                AI-Powered Forest Rights
                <br />
                <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                  Claims Management
                </span>
              </h1>
              
              <p className="text-xl text-white/90 mb-6 leading-relaxed">
                Revolutionizing FRA implementation through WebGIS technology, 
                automated document digitization, and AI-driven validation systems.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="lg" 
                  variant="forest"
                  onClick={() => onViewChange('upload')}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Claims
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => onViewChange('map')}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  <Map className="h-5 w-5 mr-2" />
                  Explore Map
                </Button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="space-y-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Active Claims</p>
                    <p className="text-2xl font-bold">2,847</p>
                  </div>
                  <FileText className="h-8 w-8 opacity-80" />
                </div>
              </Card>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5" />
                    <p className="text-sm">AI Processed</p>
                  </div>
                  <p className="text-xl font-bold">78.5%</p>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Satellite className="h-5 w-5" />
                    <p className="text-sm">Verified</p>
                  </div>
                  <p className="text-xl font-bold">1,523</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Key Features Bar */}
      <div className="bg-card border-t border-border p-4">
        <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span>OCR + NLP Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <Satellite className="h-4 w-4 text-primary" />
            <span>Satellite Imagery Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <TreePine className="h-4 w-4 text-primary" />
            <span>Forest Boundary Detection</span>
          </div>
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-primary" />
            <span>Real-time GIS Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
};