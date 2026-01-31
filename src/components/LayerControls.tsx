import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Layer {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface LayerControlsProps {
  layers: Layer[];
  activeLayers: Set<string>;
  onToggleLayer: (layerId: string) => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  layers,
  activeLayers,
  onToggleLayer,
}) => {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
        🗂️ Layer Controls
      </h3>
      
      <div className="space-y-3">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white/20"
                style={{ backgroundColor: layer.color }}
              />
              <div className="flex items-center gap-2">
                <span className="text-lg">{layer.icon}</span>
                <div>
                  <div className="font-medium text-card-foreground">{layer.name}</div>
                  {activeLayers.has(layer.id) && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <Switch
              checked={activeLayers.has(layer.id)}
              onCheckedChange={() => onToggleLayer(layer.id)}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-muted/20 rounded-lg">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{activeLayers.size}</span> of {layers.length} layers active
        </div>
      </div>
    </Card>
  );
};