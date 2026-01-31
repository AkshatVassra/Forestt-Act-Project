import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  Camera, 
  Satellite, 
  Zap, 
  Map, 
  FileImage, 
  Globe, 
  Layers,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ProcessingResult {
  id: string;
  filename: string;
  ocrText: string;
  landAnalysis: {
    landType: string;
    vegetation: string;
    area: string;
    confidence: string;
  };
  geoData: {
    coordinates: { lat: number; lng: number };
    elevation: string;
    projection: string;
  };
  status: 'processing' | 'completed' | 'error';
}

export const AIImageProcessor = () => {
  const [apiKey, setApiKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => processImage(file));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => processImage(file));
  };

  const processImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select a valid image file",
        variant: "destructive"
      });
      return;
    }

    const resultId = Date.now().toString();
    const newResult: ProcessingResult = {
      id: resultId,
      filename: file.name,
      ocrText: '',
      landAnalysis: {
        landType: '',
        vegetation: '',
        area: '',
        confidence: ''
      },
      geoData: {
        coordinates: { lat: 0, lng: 0 },
        elevation: '',
        projection: ''
      },
      status: 'processing'
    };

    setResults(prev => [...prev, newResult]);
    setIsProcessing(true);

    try {
      // Simulate multi-step AI processing
      const steps = [
        'Analyzing image metadata...',
        'Running OCR extraction...',
        'Processing with Google Vision API...',
        'Performing land parcel analysis...',
        'Converting to GeoTIFF format...',
        'Generating spatial index...',
        'Finalizing results...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setProgress(((i + 1) / steps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: `Processing ${file.name}`,
          description: steps[i]
        });
      }

      // Simulate AI analysis results
      const processedResult: ProcessingResult = {
        ...newResult,
        ocrText: `Forest Rights Claim\nClaimant: ${['Ramesh Kumar', 'Sita Devi', 'Mohan Singh'][Math.floor(Math.random() * 3)]}\nArea: ${(Math.random() * 10 + 1).toFixed(2)} hectares\nLocation: Madhya Pradesh Forest Division\nClaim Type: ${Math.random() > 0.5 ? 'Individual' : 'Community'}\nStatus: Pending Verification`,
        landAnalysis: {
          landType: Math.random() > 0.5 ? "Dense Forest" : "Mixed Forest",
          vegetation: Math.random() > 0.3 ? "Primary Forest" : "Secondary Growth",
          area: (Math.random() * 15 + 2).toFixed(2) + " hectares",
          confidence: (Math.random() * 20 + 80).toFixed(1) + "%"
        },
        geoData: {
          coordinates: { 
            lat: 20.5 + (Math.random() * 2), 
            lng: 78.0 + (Math.random() * 2) 
          },
          elevation: Math.floor(Math.random() * 500 + 200) + "m MSL",
          projection: "EPSG:4326 (WGS84)"
        },
        status: 'completed'
      };

      setResults(prev => prev.map(r => r.id === resultId ? processedResult : r));
      
      toast({
        title: "Processing Complete!",
        description: `Successfully processed ${file.name} with AI analysis`
      });

    } catch (error) {
      setResults(prev => prev.map(r => 
        r.id === resultId ? { ...r, status: 'error' as const } : r
      ));
      
      toast({
        title: "Processing Error",
        description: "Failed to process the image",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          AI Processing Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Google Vision API Key
            </label>
            <Input
              type="password"
              placeholder="Enter your API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              className="w-full"
              variant={apiKey ? "default" : "outline"}
              disabled={!apiKey}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {apiKey ? "API Connected" : "Connect API"}
            </Button>
          </div>
        </div>
      </Card>

      {/* File Upload Area */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Satellite/Drone Image Upload
        </h3>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <FileImage className="h-12 w-12 text-muted-foreground" />
            </div>
            
            <div>
              <h4 className="text-lg font-medium">Drop your images here</h4>
              <p className="text-muted-foreground">
                Supports JPG, PNG, GeoTIFF, and other satellite imagery formats
              </p>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </div>

        {/* Processing Progress */}
        {isProcessing && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Satellite className="h-4 w-4 animate-pulse" />
              Processing with AI...
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {Math.round(progress)}% Complete
            </div>
          </div>
        )}
      </Card>

      {/* Processing Results */}
      {results.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Processing Results ({results.length})
          </h3>

          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="p-4 bg-muted/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    <span className="font-medium">{result.filename}</span>
                  </div>
                  <Badge 
                    variant={
                      result.status === 'completed' ? 'default' : 
                      result.status === 'error' ? 'destructive' : 'secondary'
                    }
                  >
                    {result.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {result.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </Badge>
                </div>

                {result.status === 'completed' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* OCR Results */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">OCR Extracted Text</h4>
                      <Textarea
                        value={result.ocrText}
                        readOnly
                        className="text-xs h-24 resize-none"
                      />
                    </div>

                    {/* Land Analysis */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">AI Land Analysis</h4>
                      <div className="space-y-1 text-xs">
                        <div><strong>Type:</strong> {result.landAnalysis.landType}</div>
                        <div><strong>Vegetation:</strong> {result.landAnalysis.vegetation}</div>
                        <div><strong>Area:</strong> {result.landAnalysis.area}</div>
                        <div><strong>Confidence:</strong> {result.landAnalysis.confidence}</div>
                      </div>
                    </div>

                    {/* Geospatial Data */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Geospatial Info</h4>
                      <div className="space-y-1 text-xs">
                        <div><strong>Coordinates:</strong></div>
                        <div>{result.geoData.coordinates.lat.toFixed(6)}, {result.geoData.coordinates.lng.toFixed(6)}</div>
                        <div><strong>Elevation:</strong> {result.geoData.elevation}</div>
                        <div><strong>Projection:</strong> {result.geoData.projection}</div>
                      </div>
                    </div>
                  </div>
                )}

                {result.status === 'completed' && (
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Map className="h-3 w-3 mr-1" />
                      Add to Map
                    </Button>
                    <Button size="sm" variant="outline">
                      <Globe className="h-3 w-3 mr-1" />
                      View GeoTIFF
                    </Button>
                    <Button size="sm" variant="outline">
                      <Layers className="h-3 w-3 mr-1" />
                      Export Data
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};