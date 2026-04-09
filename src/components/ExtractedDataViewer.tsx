import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  CheckCircle,
  Copy,
  Download,
  BarChart3,
} from 'lucide-react';

interface ExtractedEntity {
  id: string;
  entity_type: string;
  entity_text: string;
  confidence: number;
}

interface OCRResult {
  raw_text: string;
  confidence: number;
  processing_time_ms: number;
}

interface ExtractedDataViewerProps {
  ocrResults: OCRResult | null;
  entities: ExtractedEntity[] | null;
  fileName: string | null;
  onSaveClaim?: (data: any) => void;
}

export const ExtractedDataViewer: React.FC<ExtractedDataViewerProps> = ({
  ocrResults,
  entities,
  fileName,
  onSaveClaim,
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadAsJSON = () => {
    const data = {
      fileName,
      timestamp: new Date().toISOString(),
      ocrResults,
      entities,
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Group entities by type
  const entitiesByType = entities?.reduce((acc, entity) => {
    if (!acc[entity.entity_type]) {
      acc[entity.entity_type] = [];
    }
    acc[entity.entity_type].push(entity);
    return acc;
  }, {} as Record<string, ExtractedEntity[]>) || {};

  return (
    <div className="space-y-6">
      {/* Processing Summary */}
      {ocrResults && (
        <Card className="p-6 border-border bg-gradient-to-br from-forest-50 to-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-lg">Processing Complete</h3>
                <p className="text-sm text-muted-foreground">{fileName}</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Success
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground">OCR Confidence</p>
              <p className="text-2xl font-bold text-forest-600">
                {ocrResults.confidence?.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground">Processing Time</p>
              <p className="text-2xl font-bold text-blue-600">
                {ocrResults.processing_time_ms}ms
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground">Entities Found</p>
              <p className="text-2xl font-bold text-purple-600">
                {entities?.length || 0}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Extracted Text */}
      {ocrResults && (
        <Card className="p-6 border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-forest-600" />
              <h3 className="font-semibold">Extracted Text</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(ocrResults.raw_text)}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
          
          <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto border border-border font-mono text-sm">
            <p className="text-foreground whitespace-pre-wrap break-words">
              {ocrResults.raw_text}
            </p>
          </div>
        </Card>
      )}

      {/* Named Entities */}
      {entities && entities.length > 0 && (
        <Card className="p-6 border-border">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-forest-600" />
            <h3 className="font-semibold">Extracted Named Entities</h3>
          </div>

          <div className="space-y-4">
            {Object.entries(entitiesByType).map(([type, typeEntities]) => (
              <div key={type} className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <span className="bg-forest-100 text-forest-700 px-2 py-1 rounded text-xs font-semibold">
                    {type}
                  </span>
                  <span className="text-muted-foreground">({typeEntities.length})</span>
                </h4>

                <div className="space-y-2">
                  {typeEntities.map((entity) => (
                    <div
                      key={entity.id}
                      className="flex items-center justify-between p-2 bg-muted rounded hover:bg-muted-foreground/20 transition"
                    >
                      <div>
                        <p className="text-sm font-medium">{entity.entity_text}</p>
                        <p className="text-xs text-muted-foreground">
                          Confidence: {(entity.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(entity.entity_text)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      {ocrResults && (
        <div className="flex gap-3">
          <Button
            onClick={downloadAsJSON}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download as JSON
          </Button>
          {onSaveClaim && (
            <Button
              onClick={() =>
                onSaveClaim({
                  raw_text: ocrResults.raw_text,
                  entities,
                  confidence: ocrResults.confidence,
                })
              }
              className="bg-forest-600 hover:bg-forest-700 text-white flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Save as Claim
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
