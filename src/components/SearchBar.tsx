import React, { useState } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';

export const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'location' | 'asset' | 'tribal'>('all');

  const searchTypes = [
    { value: 'all', label: 'All Features', icon: '🔍' },
    { value: 'location', label: 'Locations', icon: '📍' },
    { value: 'asset', label: 'Assets', icon: '🏗️' },
    { value: 'tribal', label: 'Tribal Areas', icon: '🏕️' },
  ];

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // In a real app, this would trigger map search functionality
      console.log(`Searching for: ${searchTerm} in ${searchType}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
        <Search className="w-5 h-5" />
        Search & Filter
      </h3>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search locations, assets, or features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 bg-background/80"
            />
          </div>
          <Button onClick={handleSearch} variant="default" size="sm">
            <MapPin className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter by:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-3 h-3" />
                {searchTypes.find(t => t.value === searchType)?.icon}
                {searchTypes.find(t => t.value === searchType)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {searchTypes.map((type) => (
                <DropdownMenuItem
                  key={type.value}
                  onClick={() => setSearchType(type.value as any)}
                  className="gap-2"
                >
                  <span>{type.icon}</span>
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quick search suggestions */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Forests', icon: '🌲', type: 'forest' },
            { label: 'Rivers', icon: '🌊', type: 'water' },
            { label: 'Villages', icon: '🏘️', type: 'settlement' },
            { label: 'Districts', icon: '🗺️', type: 'admin' },
          ].map((suggestion) => (
            <Button
              key={suggestion.type}
              variant="ghost"
              size="sm"
              className="justify-start gap-2 h-8 text-xs"
              onClick={() => {
                setSearchTerm(suggestion.label);
                setSearchType('all');
              }}
            >
              <span>{suggestion.icon}</span>
              {suggestion.label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};