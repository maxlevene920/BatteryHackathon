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

// Generate 100+ bikes around NYC
const generateBikes = (count: number): Bike[] => {
  const bikes: Bike[] = [];
  const nycBounds = {
    north: 40.917577,
    south: 40.477399,
    east: -73.700272,
    west: -74.259090
  };

  for (let i = 1; i <= count; i++) {
    const latitude = nycBounds.south + Math.random() * (nycBounds.north - nycBounds.south);
    const longitude = nycBounds.west + Math.random() * (nycBounds.east - nycBounds.west);
    const batteryLevel = Math.floor(Math.random() * 100);
    const statuses: Array<'available' | 'in-use' | 'maintenance'> = ['available', 'in-use', 'maintenance'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    bikes.push({
      id: i.toString(),
      location: { latitude, longitude },
      batteryLevel,
      lastUpdated: new Date().toISOString(),
      status
    });
  }

  return bikes;
};

const mockBikes = generateBikes(120);

// Cluster layer style
const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'bikes',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      10,
      '#f1f075',
      30,
      '#f28cb1'
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20,
      10,
      30,
      30,
      40
    ]
  }
} as const;

const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'bikes',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12
  }
} as const;

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
    type: 'FeatureCollection',
    features: mockBikes.map(bike => ({
      type: 'Feature',
      properties: {
        id: bike.id,
        batteryLevel: bike.batteryLevel,
        status: bike.status
      },
      geometry: {
        type: 'Point',
        coordinates: [bike.location.longitude, bike.location.latitude]
      }
    }))
  }), []);

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
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
        </Source>

        {/* Show individual markers when not clustered */}
        {mockBikes.map(bike => (
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
        </div>
      </div>
    </div>
  );
}

export default App;