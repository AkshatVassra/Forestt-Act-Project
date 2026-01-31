import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LayerControls } from './LayerControls';
import { MapLegend } from './MapLegend';
import { SearchBar } from './SearchBar';
import { toast } from 'sonner';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Madhya Pradesh GeoJSON data with realistic coordinates and features
const madhyaPradeshGeoData = {
  state: {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: { 
          name: "Madhya Pradesh", 
          population: 72626809, 
          type: "state",
          capital: "Bhopal",
          area: 308245,
          established: "1956"
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [[[74.0, 21.0], [82.8, 21.0], [82.8, 26.9], [74.0, 26.9], [74.0, 21.0]]]
        }
      }
    ]
  },
  nationalParks: {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: { 
          name: "Kanha National Park", 
          forest_type: "Tropical Dry Forest", 
          area: 940,
          wildlife: "Tigers, Leopards, Wild Dogs, Barasingha",
          established: "1955"
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [[[80.4, 22.1], [80.8, 22.1], [80.8, 22.4], [80.4, 22.4], [80.4, 22.1]]]
        }
      },
      {
        type: "Feature" as const,
        properties: { 
          name: "Bandhavgarh National Park", 
          forest_type: "Tropical Mixed Forest", 
          area: 448,
          wildlife: "Tigers, Leopards, Sambar, Chital",
          established: "1968"
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [[[80.8, 23.5], [81.2, 23.5], [81.2, 23.8], [80.8, 23.8], [80.8, 23.5]]]
        }
      },
      {
        type: "Feature" as const,
        properties: { 
          name: "Pench National Park", 
          forest_type: "Southern Dry Mixed Forest", 
          area: 292,
          wildlife: "Tigers, Leopards, Wild Boar, Nilgai",
          established: "1975"
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [[[79.1, 21.6], [79.4, 21.6], [79.4, 21.9], [79.1, 21.9], [79.1, 21.6]]]
        }
      },
      {
        type: "Feature" as const,
        properties: { 
          name: "Satpura National Park", 
          forest_type: "Central Indian Dry Forest", 
          area: 524,
          wildlife: "Tigers, Leopards, Sloth Bears, Indian Giant Squirrel",
          established: "1981"
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [[[78.2, 22.4], [78.6, 22.4], [78.6, 22.7], [78.2, 22.7], [78.2, 22.4]]]
        }
      }
    ]
  },
  waterBodies: {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: { 
          name: "Narmada River", 
          water_type: "Major River",
          length: 1312,
          significance: "Sacred river flowing westward through MP"
        },
        geometry: {
          type: "LineString" as const,
          coordinates: [[81.8, 22.7], [80.2, 22.8], [78.5, 22.9], [76.5, 22.3], [75.1, 21.8]]
        }
      },
      {
        type: "Feature" as const,
        properties: { 
          name: "Chambal River", 
          water_type: "Major River",
          length: 960,
          significance: "Important tributary with National Chambal Sanctuary"
        },
        geometry: {
          type: "LineString" as const,
          coordinates: [[77.8, 22.6], [78.5, 24.5], [79.0, 25.8], [78.2, 26.5]]
        }
      },
      {
        type: "Feature" as const,
        properties: { 
          name: "Betwa River", 
          water_type: "River",
          length: 590,
          significance: "Tributary of Yamuna"
        },
        geometry: {
          type: "LineString" as const,
          coordinates: [[77.8, 23.2], [78.2, 24.0], [78.8, 25.2]]
        }
      }
    ]
  },
  tribalAreas: {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: { 
          name: "Baiga Tribal Area", 
          tribe: "Baiga", 
          population: 250000,
          district: "Dindori, Mandla",
          culture: "Forest-dependent traditional lifestyle"
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [[[80.8, 22.8], [81.4, 22.8], [81.4, 23.2], [80.8, 23.2], [80.8, 22.8]]]
        }
      },
      {
        type: "Feature" as const,
        properties: { 
          name: "Gond Tribal Region", 
          tribe: "Gond", 
          population: 1200000,
          district: "Chhindwara, Seoni, Mandla",
          culture: "Agricultural and forest-based community"
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [[[78.5, 21.8], [80.2, 21.8], [80.2, 22.8], [78.5, 22.8], [78.5, 21.8]]]
        }
      },
      {
        type: "Feature" as const,
        properties: { 
          name: "Bhil Tribal Area", 
          tribe: "Bhil", 
          population: 800000,
          district: "Jhabua, Alirajpur, Dhar",
          culture: "Traditional archery and forest knowledge"
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [[[74.2, 22.0], [75.5, 22.0], [75.5, 23.0], [74.2, 23.0], [74.2, 22.0]]]
        }
      }
    ]
  },
  farmlands: {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: { 
          name: "Malwa Plateau Agriculture", 
          crop_type: "Wheat, Soybean, Cotton", 
          area: 8500,
          soil_type: "Black Cotton Soil",
          productivity: "High"
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [[[75.0, 22.5], [77.5, 22.5], [77.5, 24.5], [75.0, 24.5], [75.0, 22.5]]]
        }
      },
      {
        type: "Feature" as const,
        properties: { 
          name: "Nimar Valley Agriculture", 
          crop_type: "Cotton, Sugarcane, Maize", 
          area: 4200,
          soil_type: "Alluvial Soil",
          productivity: "High"
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [[[75.5, 21.5], [77.0, 21.5], [77.0, 22.5], [75.5, 22.5], [75.5, 21.5]]]
        }
      },
      {
        type: "Feature" as const,
        properties: { 
          name: "Bundelkhand Agriculture", 
          crop_type: "Wheat, Gram, Mustard", 
          area: 3800,
          soil_type: "Mixed Red and Black",
          productivity: "Medium"
        },
        geometry: {
          type: "Polygon" as const,
          coordinates: [[[78.0, 24.0], [80.5, 24.0], [80.5, 26.0], [78.0, 26.0], [78.0, 24.0]]]
        }
      }
    ]
  }
};

export const GISMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [layerGroups, setLayerGroups] = useState<Record<string, L.LayerGroup>>({});
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(['boundaries']));

  const layerTypes = [
    { id: 'boundaries', name: 'Administrative Boundaries', color: 'hsl(var(--admin-primary))', icon: '🗺️' },
    { id: 'forest', name: 'Forest Cover', color: 'hsl(var(--forest-primary))', icon: '🌲' },
    { id: 'water', name: 'Water Bodies', color: 'hsl(var(--water-primary))', icon: '💧' },
    { id: 'farmlands', name: 'Agricultural Lands', color: 'hsl(var(--land-primary))', icon: '🌾' },
    { id: 'settlements', name: 'Settlements', color: 'hsl(220 14% 35%)', icon: '🏘️' },
    { id: 'tribal', name: 'Tribal Areas', color: 'hsl(var(--tribal-primary))', icon: '🏕️' },
    { id: 'assets', name: 'Infrastructure', color: 'hsl(280 15% 45%)', icon: '🏗️' },
    { id: 'streams', name: 'Rivers & Streams', color: 'hsl(var(--water-secondary))', icon: '🌊' },
  ];

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Leaflet map centered on Madhya Pradesh
    const leafletMap = L.map(mapRef.current).setView([23.4734, 77.9473], 7); // MP center

    // Add tile layers
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
    });

    const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenTopoMap contributors'
    });

    // Add base layer control
    const baseLayers = {
      "Street Map": osmLayer,
      "Satellite": satelliteLayer,
      "Terrain": terrainLayer
    };

    osmLayer.addTo(leafletMap);
    L.control.layers(baseLayers).addTo(leafletMap);

    // Add scale control
    L.control.scale().addTo(leafletMap);

    // Create layer groups for different data types
    const newLayerGroups: Record<string, L.LayerGroup> = {};
    
    // Administrative boundaries - Madhya Pradesh state
    const boundariesGroup = L.layerGroup();
    L.geoJSON(madhyaPradeshGeoData.state, {
      style: {
        color: 'hsl(var(--admin-primary))',
        weight: 3,
        fillOpacity: 0.1,
        fillColor: 'hsl(var(--admin-primary))'
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          layer.bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-lg mb-2">${feature.properties.name}</h3>
              <div class="space-y-1 text-sm">
                <p><strong>Capital:</strong> ${feature.properties.capital}</p>
                <p><strong>Population:</strong> ${feature.properties.population?.toLocaleString()}</p>
                <p><strong>Area:</strong> ${feature.properties.area?.toLocaleString()} sq km</p>
                <p><strong>Established:</strong> ${feature.properties.established}</p>
              </div>
            </div>
          `);
        }
      }
    }).addTo(boundariesGroup);
    newLayerGroups.boundaries = boundariesGroup;

    // National Parks and Forest Reserves
    const forestGroup = L.layerGroup();
    L.geoJSON(madhyaPradeshGeoData.nationalParks, {
      style: {
        color: 'hsl(var(--forest-primary))',
        weight: 2,
        fillOpacity: 0.7,
        fillColor: 'hsl(var(--forest-secondary))'
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          layer.bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-lg mb-2">🌲 ${feature.properties.name}</h3>
              <div class="space-y-1 text-sm">
                <p><strong>Forest Type:</strong> ${feature.properties.forest_type}</p>
                <p><strong>Area:</strong> ${feature.properties.area} sq km</p>
                <p><strong>Wildlife:</strong> ${feature.properties.wildlife}</p>
                <p><strong>Established:</strong> ${feature.properties.established}</p>
              </div>
            </div>
          `);
        }
      }
    }).addTo(forestGroup);
    newLayerGroups.forest = forestGroup;

    // Water bodies - Rivers of Madhya Pradesh
    const waterGroup = L.layerGroup();
    L.geoJSON(madhyaPradeshGeoData.waterBodies, {
      style: {
        color: 'hsl(var(--water-primary))',
        weight: 4,
        opacity: 0.8
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          layer.bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-lg mb-2">💧 ${feature.properties.name}</h3>
              <div class="space-y-1 text-sm">
                <p><strong>Type:</strong> ${feature.properties.water_type}</p>
                <p><strong>Length:</strong> ${feature.properties.length} km</p>
                <p><strong>Significance:</strong> ${feature.properties.significance}</p>
              </div>
            </div>
          `);
        }
      }
    }).addTo(waterGroup);
    newLayerGroups.water = waterGroup;

    // Tribal areas of Madhya Pradesh
    const tribalGroup = L.layerGroup();
    L.geoJSON(madhyaPradeshGeoData.tribalAreas, {
      style: {
        color: 'hsl(var(--tribal-primary))',
        weight: 2,
        fillOpacity: 0.5,
        fillColor: 'hsl(var(--tribal-secondary))'
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          layer.bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-lg mb-2">🏕️ ${feature.properties.name}</h3>
              <div class="space-y-1 text-sm">
                <p><strong>Tribe:</strong> ${feature.properties.tribe}</p>
                <p><strong>Population:</strong> ${feature.properties.population?.toLocaleString()}</p>
                <p><strong>District:</strong> ${feature.properties.district}</p>
                <p><strong>Culture:</strong> ${feature.properties.culture}</p>
              </div>
            </div>
          `);
        }
      }
    }).addTo(tribalGroup);
    newLayerGroups.tribal = tribalGroup;

    // Agricultural lands of Madhya Pradesh
    const farmlandGroup = L.layerGroup();
    L.geoJSON(madhyaPradeshGeoData.farmlands, {
      style: {
        color: 'hsl(var(--land-primary))',
        weight: 1,
        fillOpacity: 0.4,
        fillColor: 'hsl(var(--land-secondary))'
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          layer.bindPopup(`
            <div class="p-2">
              <h3 class="font-bold text-lg mb-2">🌾 ${feature.properties.name}</h3>
              <div class="space-y-1 text-sm">
                <p><strong>Crops:</strong> ${feature.properties.crop_type}</p>
                <p><strong>Area:</strong> ${feature.properties.area} hectares</p>
                <p><strong>Soil Type:</strong> ${feature.properties.soil_type}</p>
                <p><strong>Productivity:</strong> ${feature.properties.productivity}</p>
              </div>
            </div>
          `);
        }
      }
    }).addTo(farmlandGroup);
    newLayerGroups.farmlands = farmlandGroup;

    // Major settlements in Madhya Pradesh
    const settlementsGroup = L.layerGroup();
    const settlements = [
      { name: 'Bhopal', coords: [23.2599, 77.4126], population: 1883381, type: 'Capital City' },
      { name: 'Indore', coords: [22.7196, 75.8577], population: 3272335, type: 'Commercial Hub' },
      { name: 'Gwalior', coords: [26.2183, 78.1828], population: 1101981, type: 'Historic City' },
      { name: 'Jabalpur', coords: [23.1815, 79.9864], population: 1268848, type: 'Educational Center' },
      { name: 'Ujjain', coords: [23.1765, 75.7885], population: 515215, type: 'Religious Center' },
      { name: 'Sagar', coords: [23.8388, 78.7378], population: 273357, type: 'District Headquarters' },
      { name: 'Dewas', coords: [22.9676, 76.0534], population: 289550, type: 'Industrial City' },
      { name: 'Satna', coords: [24.5708, 80.8311], population: 283004, type: 'Cement Hub' },
    ];

    settlements.forEach(settlement => {
      const marker = L.circleMarker([settlement.coords[0], settlement.coords[1]], {
        radius: Math.sqrt(settlement.population / 100000) + 4,
        fillColor: 'hsl(var(--settlement-primary))',
        color: 'hsl(var(--settlement-secondary))',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7
      }).bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-lg mb-2">🏘️ ${settlement.name}</h3>
          <div class="space-y-1 text-sm">
            <p><strong>Population:</strong> ${settlement.population.toLocaleString()}</p>
            <p><strong>Type:</strong> ${settlement.type}</p>
          </div>
        </div>
      `);
      settlementsGroup.addLayer(marker);
    });
    newLayerGroups.settlements = settlementsGroup;

    // Infrastructure assets in Madhya Pradesh
    const assetsGroup = L.layerGroup();
    const assets = [
      { name: 'Raja Bhoj Airport', coords: [23.2876, 77.3376], type: 'Airport', city: 'Bhopal' },
      { name: 'Indore Airport', coords: [22.7218, 75.8011], type: 'Airport', city: 'Indore' },
      { name: 'BHEL Bhopal', coords: [23.2156, 77.4057], type: 'Heavy Industry', city: 'Bhopal' },
      { name: 'IIT Indore', coords: [22.6781, 75.9253], type: 'Educational Institution', city: 'Indore' },
      { name: 'Vindhyachal Thermal Power', coords: [24.1093, 82.6531], type: 'Power Plant', city: 'Singrauli' },
      { name: 'Korba Thermal Power', coords: [22.3595, 82.7501], type: 'Power Plant', city: 'Korba' },
    ];

    assets.forEach(asset => {
      const marker = L.marker([asset.coords[0], asset.coords[1]])
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-lg mb-2">🏗️ ${asset.name}</h3>
            <div class="space-y-1 text-sm">
              <p><strong>Type:</strong> ${asset.type}</p>
              <p><strong>Location:</strong> ${asset.city}</p>
            </div>
          </div>
        `);
      assetsGroup.addLayer(marker);
    });
    newLayerGroups.assets = assetsGroup;

    // Create streams layer (same as water for demo)
    newLayerGroups.streams = waterGroup;

    setLayerGroups(newLayerGroups);
    setMap(leafletMap);

    // Add only boundaries layer initially
    boundariesGroup.addTo(leafletMap);

    toast.success('Madhya Pradesh GIS Map loaded successfully with all layers!');

    return () => {
      leafletMap.remove();
    };
  }, []);

  const toggleLayer = (layerId: string) => {
    if (!map) return;
    
    const newActiveLayers = new Set(activeLayers);
    const layerGroup = layerGroups[layerId];
    
    if (!layerGroup) return;
    
    if (activeLayers.has(layerId)) {
      newActiveLayers.delete(layerId);
      map.removeLayer(layerGroup);
      toast.info(`${layerTypes.find(l => l.id === layerId)?.name} layer hidden`);
    } else {
      newActiveLayers.add(layerId);
      layerGroup.addTo(map);
      toast.success(`${layerTypes.find(l => l.id === layerId)?.name} layer activated`);
    }
    
    setActiveLayers(newActiveLayers);
  };

  return (
    <div className="min-h-screen bg-gradient-map">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-gradient-sidebar border-r border-border shadow-panel overflow-y-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">WEB GIS MAP</h1>
            <p className="text-muted-foreground mb-6">Geographic Information System for the Heart of India</p>
            
            <SearchBar />
            
            <div className="mt-6">
              <LayerControls 
                layers={layerTypes}
                activeLayers={activeLayers}
                onToggleLayer={toggleLayer}
              />
            </div>
            
            <div className="mt-8">
              <MapLegend layers={layerTypes} activeLayers={activeLayers} />
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="absolute inset-0 rounded-lg shadow-map" />
          
          {/* Map Overlay Info */}
          <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg shadow-layer p-4 max-w-sm z-[1000]">
            <h3 className="font-semibold text-card-foreground mb-2">Active Layers: {activeLayers.size}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              {Array.from(activeLayers).map(layerId => {
                const layer = layerTypes.find(l => l.id === layerId);
                return layer ? (
                  <div key={layerId} className="flex items-center gap-2">
                    <span>{layer.icon}</span>
                    <span>{layer.name}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Feature Info Panel */}
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg shadow-layer p-4 max-w-sm z-[1000]">
            <h3 className="font-semibold text-card-foreground mb-2">🌍 Madhya Pradesh Features</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• Explore national parks and wildlife sanctuaries</div>
              <div>• Discover tribal communities and their heritage</div>
              <div>• View major rivers and water resources</div>
              <div>• Analyze agricultural zones and productivity</div>
              <div>• Click on features for detailed information</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};