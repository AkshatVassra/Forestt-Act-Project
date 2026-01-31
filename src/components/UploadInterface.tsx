import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  FileText, 
  Image, 
  Scan, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  Languages,
  Camera,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface UploadInterfaceProps {
  onBack: () => void;
}

export const UploadInterface = ({ onBack }: UploadInterfaceProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [aiValidation, setAiValidation] = useState(0);

  // Mock OCR results
  const mockOcrResults = {
    claimantName: 'राम कुमार शर्मा (Ram Kumar Sharma)',
    fatherName: 'श्याम लाल शर्मा (Shyam Lal Sharma)',
    village: 'भीमपुर (Bhimpur)',
    district: 'रायपुर (Raipur)',
    state: 'छत्तीसगढ़ (Chhattisgarh)',
    landArea: '2.5 हेक्टेयर (2.5 hectares)',
    coordinates: '21.2515°N, 81.6296°E',
    claimType: 'व्यक्तिगत दावा (Individual Claim)',
    confidence: 94.2
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} file(s) uploaded successfully`);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
      toast.success(`${files.length} file(s) uploaded successfully`);
    }
  };

  const simulateProcessing = () => {
    setProcessingStatus('processing');
    setOcrProgress(0);
    setAiValidation(0);

    // Simulate OCR processing
    const ocrInterval = setInterval(() => {
      setOcrProgress(prev => {
        if (prev >= 100) {
          clearInterval(ocrInterval);
          
          // Start AI validation
          const aiInterval = setInterval(() => {
            setAiValidation(prevAi => {
              if (prevAi >= 100) {
                clearInterval(aiInterval);
                setProcessingStatus('completed');
                toast.success('Document processing completed!');
                return 100;
              }
              return prevAi + Math.random() * 15;
            });
          }, 200);
          
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 150);

    toast.info('Starting AI-powered document processing...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Upload Forest Rights Claims</h1>
          <p className="text-muted-foreground">
            AI-powered OCR and document digitization with multi-language support
          </p>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Document Upload</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Upload Area */}
          <Card className="shadow-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Document Upload
              </CardTitle>
              <CardDescription>
                Drag and drop documents or click to select. Supports PDF, JPG, PNG. OCR supports Hindi, English, and regional languages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
                <p className="text-muted-foreground mb-4">
                  Drag files here or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="forest">
                    Select Files
                  </Button>
                </label>
                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Languages className="h-4 w-4" />
                    Multi-language OCR
                  </div>
                  <div className="flex items-center gap-1">
                    <Brain className="h-4 w-4" />
                    AI Validation
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    GPS Extraction
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="font-medium">Uploaded Files ({uploadedFiles.length})</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                  ))}
                  
                  {uploadedFiles.length > 0 && processingStatus === 'idle' && (
                    <Button 
                      onClick={simulateProcessing} 
                      variant="forest"
                      className="w-full mt-4"
                    >
                      <Scan className="h-4 w-4 mr-2" />
                      Start AI Processing
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Status */}
          {processingStatus !== 'idle' && (
            <Card className="shadow-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Processing Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">OCR & Text Extraction</span>
                      <span className="text-sm text-muted-foreground">{Math.round(ocrProgress)}%</span>
                    </div>
                    <Progress value={ocrProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Extracting text from documents using multi-language OCR
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">AI Validation & Parsing</span>
                      <span className="text-sm text-muted-foreground">{Math.round(aiValidation)}%</span>
                    </div>
                    <Progress value={aiValidation} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Validating extracted data and parsing structured information
                    </p>
                  </div>
                </div>

                {processingStatus === 'completed' && (
                  <div className="mt-6 p-4 border rounded-lg bg-success/10">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <h4 className="font-medium text-success">Processing Complete</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Claimant:</strong> {mockOcrResults.claimantName}</p>
                        <p><strong>Father's Name:</strong> {mockOcrResults.fatherName}</p>
                        <p><strong>Village:</strong> {mockOcrResults.village}</p>
                        <p><strong>District:</strong> {mockOcrResults.district}</p>
                      </div>
                      <div>
                        <p><strong>Land Area:</strong> {mockOcrResults.landArea}</p>
                        <p><strong>Coordinates:</strong> {mockOcrResults.coordinates}</p>
                        <p><strong>Claim Type:</strong> {mockOcrResults.claimType}</p>
                        <p><strong>Confidence:</strong> <Badge variant="outline">{mockOcrResults.confidence}%</Badge></p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="forest">
                        Approve & Submit
                      </Button>
                      <Button size="sm" variant="outline">
                        Review & Edit
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manual">
          <Card className="shadow-panel">
            <CardHeader>
              <CardTitle>Manual Claim Entry</CardTitle>
              <CardDescription>Enter forest rights claim details manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="claimant-name">Claimant Name</Label>
                  <Input id="claimant-name" placeholder="Enter claimant name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="father-name">Father's Name</Label>
                  <Input id="father-name" placeholder="Enter father's name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="village">Village</Label>
                  <Input id="village" placeholder="Enter village name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raipur">Raipur</SelectItem>
                      <SelectItem value="bilaspur">Bilaspur</SelectItem>
                      <SelectItem value="durg">Durg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="land-area">Land Area (hectares)</Label>
                  <Input id="land-area" type="number" placeholder="Enter land area" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claim-type">Claim Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select claim type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coordinates">GPS Coordinates (Optional)</Label>
                <Input id="coordinates" placeholder="Latitude, Longitude (e.g., 21.2515, 81.6296)" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Additional Details</Label>
                <Textarea id="description" placeholder="Enter any additional details about the claim" />
              </div>
              
              <Button className="w-full" variant="forest">
                Submit Manual Claim
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card className="shadow-panel">
            <CardHeader>
              <CardTitle>Batch Processing</CardTitle>
              <CardDescription>Process multiple documents simultaneously</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Batch Processing</h3>
                <p className="text-muted-foreground mb-4">
                  Upload multiple documents for automated batch processing
                </p>
                <Button variant="forest">
                  Select Multiple Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};