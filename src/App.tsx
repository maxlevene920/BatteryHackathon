import React, { useState, useMemo } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl';
import { Battery } from 'lucide-react';
import { BikeDashboard } from './components/BikeDashboard';
import type { Bike } from './types';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  throw new Error(
    "You need to provide a Mapbox token in your .env file (VITE_MAPBOX_TOKEN)"
  );
}

// Define major NYC hub coordinates
const NYC_HUBS = {
  timesSquare: { lat: 40.7580, lng: -73.9855 },
  midtownEast: { lat: 40.7549, lng: -73.9749 },
  midtownWest: { lat: 40.7551, lng: -73.9947 },
  downtown: { lat: 40.7127, lng: -74.0134 },
  financialDistrict: { lat: 40.7075, lng: -74.0021 },
  upperEastSide: { lat: 40.7736, lng: -73.9566 },
  upperWestSide: { lat: 40.7870, lng: -73.9754 },
  centralPark: { lat: 40.7829, lng: -73.9654 }
};

// Generate bikes with realistic distribution around NYC hubs
const generateBikes = (count: number): Bike[] => {
  const bikes: Bike[] = [];
  
  // Distribution weights for different areas
  const distribution = {
    midtown: 0.4,  // 40% of bikes
    downtown: 0.3, // 30% of bikes
    uptown: 0.2,   // 20% of bikes
    scattered: 0.1 // 10% scattered randomly
  };

  const generateBikeAroundPoint = (centerLat: number, centerLng: number, radius: number) => {
    // Convert radius from kilometers to degrees (approximate)
    const latRadius = radius / 111.32;
    const lngRadius = radius / (111.32 * Math.cos(centerLat * Math.PI / 180));
    
    const lat = centerLat + (Math.random() - 0.5) * latRadius * 2;
    const lng = centerLng + (Math.random() - 0.5) * lngRadius * 2;
    
    return { latitude: lat, longitude: lng };
  };

  // Generate bikes according to distribution
  for (let i = 1; i <= count; i++) {
    let location;
    const random = Math.random();
    
    if (random < distribution.midtown) {
      // Midtown bikes (concentrated around Times Square and surrounding areas)
      const midtownHubs = [NYC_HUBS.timesSquare, NYC_HUBS.midtownEast, NYC_HUBS.midtownWest];
      const hub = midtownHubs[Math.floor(Math.random() * midtownHubs.length)];
      location = generateBikeAroundPoint(hub.lat, hub.lng, 0.5);
    } else if (random < distribution.midtown + distribution.downtown) {
      // Downtown bikes
      const downtownHubs = [NYC_HUBS.downtown, NYC_HUBS.financialDistrict];
      const hub = downtownHubs[Math.floor(Math.random() * downtownHubs.length)];
      location = generateBikeAroundPoint(hub.lat, hub.lng, 0.7);
    } else if (random < distribution.midtown + distribution.downtown + distribution.uptown) {
      // Uptown bikes
      const uptownHubs = [NYC_HUBS.upperEastSide, NYC_HUBS.upperWestSide, NYC_HUBS.centralPark];
      const hub = uptownHubs[Math.floor(Math.random() * uptownHubs.length)];
      location = generateBikeAroundPoint(hub.lat, hub.lng, 0.6);
    } else {
      // Scattered bikes
      const nycBounds = {
        north: 40.917577,
        south: 40.477399,
        east: -73.700272,
        west: -74.259090
      };
      location = {
        latitude: nycBounds.south + Math.random() * (nycBounds.north - nycBounds.south),
        longitude: nycBounds.west + Math.random() * (nycBounds.east - nycBounds.west)
      };
    }

    const batteryLevel = Math.floor(Math.random() * 100);
    const statuses: Array<'available' | 'in-use' | 'maintenance'> = ['available', 'in-use', 'maintenance'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    bikes.push({
      id: i.toString(),
      location,
      batteryLevel,
      lastUpdated: new Date().toISOString(),
      status
    });
  }

  return bikes;
};

const mockBikes = generateBikes(200); // Increased number of bikes for better visualization

function App() {
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    zoom: 11
  });

  const getBatteryColor = (level: number) => {
    if (level <= 20) return 'text-red-500';
    if (level <= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Convert bikes to GeoJSON for clustering
  const geojsonBikes = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: mockBikes.map(bike => ({
      type: 'Feature' as const,
      properties: {
        id: bike.id,
        batteryLevel: bike.batteryLevel,
        status: bike.status
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [bike.location.longitude, bike.location.latitude]
      }
    }))
  }), []);

  // Only show individual markers when zoomed in enough
  const shouldShowIndividualMarkers = viewState.zoom >= 14;

  return (
    <div className="h-screen w-screen relative">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <Source
          id="bikes"
          type="geojson"
          data={geojsonBikes}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer
            id="clusters"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',  // Small clusters
                10,
                '#f1f075',  // Medium clusters
                30,
                '#f28cb1'   // Large clusters
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,   // Default size
                10,   // Size for 10+ bikes
                30,   // Size for 30+ bikes
                30,
                40
              ]
            }}
          />
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            }}
          />
          <Layer
            id="unclustered-point"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': [
                'case',
                ['<=', ['get', 'batteryLevel'], 20], '#ef4444',  // Red for low battery
                ['<=', ['get', 'batteryLevel'], 50], '#eab308',  // Yellow for medium battery
                '#22c55e'  // Green for high battery
              ],
              'circle-radius': 8,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#fff'
            }}
          />
        </Source>

        {/* Only render individual markers when zoomed in */}
        {shouldShowIndividualMarkers && mockBikes.map(bike => (
          <Marker
            key={bike.id}
            latitude={bike.location.latitude}
            longitude={bike.location.longitude}
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedBike(bike);
            }}
          >
            <Battery className={`w-8 h-8 ${getBatteryColor(bike.batteryLevel)} cursor-pointer`} />
          </Marker>
        ))}

        {selectedBike && (
          <Popup
            latitude={selectedBike.location.latitude}
            longitude={selectedBike.location.longitude}
            onClose={() => setSelectedBike(null)}
            closeButton={false}
            closeOnClick={false}
            className="w-96"
          >
            <BikeDashboard
              bike={selectedBike}
              onClose={() => setSelectedBike(null)}
            />
          </Popup>
        )}
      </Map>

      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-2">NYC E-Bike Monitor</h1>
        <p className="text-gray-600">Monitoring {mockBikes.length} e-bikes</p>
        <p className="text-sm text-gray-500 mt-1">
          {viewState.zoom < 14 
            ? 'Zoom in to see individual bikes' 
            : 'Showing individual bikes'}
        </p>
      </div>

      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-2">Map Legend</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#51bbd6]"></div>
            <span>Small cluster (&lt; 10 bikes)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#f1f075]"></div>
            <span>Medium cluster (10-30 bikes)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#f28cb1]"></div>
            <span>Large cluster (30+ bikes)</span>
          </div>
          {viewState.zoom >= 14 && (
            <>
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-red-500" />
                <span>Low Battery (&lt; 20%)</span>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-yellow-500" />
                <span>Medium Battery (20-50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-green-500" />
                <span>High Battery (&gt; 50%)</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;