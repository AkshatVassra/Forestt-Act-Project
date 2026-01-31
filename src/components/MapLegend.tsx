import React from 'react';
import { Card } from '@/components/ui/card';

interface Layer {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface MapLegendProps {
  layers: Layer[];
  activeLayers: Set<string>;
}

export const MapLegend: React.FC<MapLegendProps> = ({ layers, activeLayers }) => {
  const activeLegendItems = layers.filter(layer => activeLayers.has(layer.id));

  if (activeLegendItems.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
        📍 Map Legend
      </h3>
      
      <div className="space-y-3">
        {activeLegendItems.map((layer) => (
          <div key={layer.id} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border border-white/20"
                style={{ backgroundColor: layer.color }}
              />
              <span className="text-sm">{layer.icon}</span>
            </div>
            <span className="text-sm font-medium text-card-foreground">
              {layer.name}
            </span>
          </div>
        ))}
      </div>
      
      {/* Additional legend items for specific features */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <h4 className="text-sm font-semibold text-card-foreground mb-2">Symbols</h4>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 border-2 border-admin-primary rounded-sm" />
            <span>Administrative Boundaries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-forest-primary rounded-full" />
            <span>Forest Areas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-water-primary" />
            <span>Water Bodies & Rivers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-tribal-primary" />
            <span>Tribal Settlements</span>
          </div>
        </div>
      </div>
    </Card>
  );
};