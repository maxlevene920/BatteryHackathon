import React, { useState, useMemo } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl';
import { Battery, Bike as BikeIcon, Zap } from 'lucide-react';
import { VehicleDashboard } from './components/VehicleDashboard';
import { StatsDashboard } from './components/StatsDashboard';
import type { Vehicle, BatteryRiskLevel } from './types';
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

// Vehicle models
const VEHICLE_MODELS = {
  bikes: ['Classic-1', 'Mountain-X', 'Urban-2'],
  scooters: ['Speeder-S1', 'City-Glide', 'Max-R']
};

const generateBatteryHealth = (batteryLevel: number, cycleCount: number) => {
  // Determine risk level based on multiple factors
  let riskLevel: BatteryRiskLevel = 'low';
  const temperature = 20 + Math.random() * 30; // 20-50°C
  const voltageStability = 85 + Math.random() * 15; // 85-100%
  
  // Risk factors:
  // 1. High temperature (> 45°C is dangerous)
  // 2. Low voltage stability (< 90% is concerning)
  // 3. High cycle count (> 500 is concerning)
  // 4. Low battery level with high temperature
  
  if (
    temperature > 45 || 
    voltageStability < 87 ||
    (batteryLevel < 20 && temperature > 40) ||
    cycleCount > 800
  ) {
    riskLevel = 'critical';
  } else if (
    temperature > 40 ||
    voltageStability < 90 ||
    (batteryLevel < 30 && temperature > 35) ||
    cycleCount > 500
  ) {
    riskLevel = 'high';
  } else if (
    temperature > 35 ||
    voltageStability < 95 ||
    cycleCount > 300
  ) {
    riskLevel = 'moderate';
  }

  return {
    riskLevel,
    temperature,
    cycleCount,
    lastInspectionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
    voltageStability
  };
};

// Generate vehicles with realistic distribution around NYC hubs
const generateVehicles = (count: number): Vehicle[] => {
  const vehicles: Vehicle[] = [];
  
  // Distribution weights for different areas
  const distribution = {
    midtown: 0.4,  // 40% of vehicles
    downtown: 0.3, // 30% of vehicles
    uptown: 0.2,   // 20% of vehicles
    scattered: 0.1 // 10% scattered randomly
  };

  const generateVehicleAroundPoint = (centerLat: number, centerLng: number, radius: number) => {
    const latRadius = radius / 111.32;
    const lngRadius = radius / (111.32 * Math.cos(centerLat * Math.PI / 180));
    
    const lat = centerLat + (Math.random() - 0.5) * latRadius * 2;
    const lng = centerLng + (Math.random() - 0.5) * lngRadius * 2;
    
    return { latitude: lat, longitude: lng };
  };

  for (let i = 1; i <= count; i++) {
    let location;
    const random = Math.random();
    
    if (random < distribution.midtown) {
      const midtownHubs = [NYC_HUBS.timesSquare, NYC_HUBS.midtownEast, NYC_HUBS.midtownWest];
      const hub = midtownHubs[Math.floor(Math.random() * midtownHubs.length)];
      location = generateVehicleAroundPoint(hub.lat, hub.lng, 0.5);
    } else if (random < distribution.midtown + distribution.downtown) {
      const downtownHubs = [NYC_HUBS.downtown, NYC_HUBS.financialDistrict];
      const hub = downtownHubs[Math.floor(Math.random() * downtownHubs.length)];
      location = generateVehicleAroundPoint(hub.lat, hub.lng, 0.7);
    } else if (random < distribution.midtown + distribution.downtown + distribution.uptown) {
      const uptownHubs = [NYC_HUBS.upperEastSide, NYC_HUBS.upperWestSide, NYC_HUBS.centralPark];
      const hub = uptownHubs[Math.floor(Math.random() * uptownHubs.length)];
      location = generateVehicleAroundPoint(hub.lat, hub.lng, 0.6);
    } else {
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

    const type = Math.random() > 0.4 ? 'bike' : 'scooter'; // 60% bikes, 40% scooters
    const models = type === 'bike' ? VEHICLE_MODELS.bikes : VEHICLE_MODELS.scooters;
    const model = models[Math.floor(Math.random() * models.length)];
    
    const batteryLevel = Math.floor(Math.random() * 100);
    const cycleCount = Math.floor(Math.random() * 1000); // 0-1000 cycles
    const batteryHealth = generateBatteryHealth(batteryLevel, cycleCount);
    
    const statuses: Array<'available' | 'in-use' | 'maintenance'> = ['available', 'in-use', 'maintenance'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    vehicles.push({
      id: i.toString(),
      type,
      model,
      location,
      batteryLevel,
      batteryHealth,
      lastUpdated: new Date().toISOString(),
      status
    });
  }

  return vehicles;
};

const mockVehicles = generateVehicles(200);

function App() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
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

  const geojsonVehicles = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: mockVehicles.map(vehicle => ({
      type: 'Feature' as const,
      properties: {
        id: vehicle.id,
        batteryLevel: vehicle.batteryLevel,
        status: vehicle.status,
        type: vehicle.type
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [vehicle.location.longitude, vehicle.location.latitude]
      }
    }))
  }), []);

  const shouldShowIndividualMarkers = viewState.zoom >= 14;

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <Source
          id="vehicles"
          type="geojson"
          data={geojsonVehicles}
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
                ['<=', ['get', 'batteryLevel'], 20], '#ef4444',
                ['<=', ['get', 'batteryLevel'], 50], '#eab308',
                '#22c55e'
              ],
              'circle-radius': 8,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#fff'
            }}
          />
        </Source>

        {shouldShowIndividualMarkers && mockVehicles.map(vehicle => {
          const isCriticalCharge = vehicle.batteryLevel <= 20;
          const isCriticalHealth = vehicle.batteryHealth.temperature > 40;
          const isMediumCharge = vehicle.batteryLevel <= 50;
          const isModerateHealth = vehicle.batteryHealth.temperature > 35;
          
          let statusColor = 'text-green-500';
          let healthDotColor = 'bg-green-500';
          
          if (isCriticalCharge || isCriticalHealth) {
            statusColor = 'text-red-500';
            healthDotColor = 'bg-red-500';
          } else if (isMediumCharge || isModerateHealth) {
            statusColor = 'text-yellow-500';
            healthDotColor = 'bg-yellow-500';
          }

          return (
            <Marker
              key={vehicle.id}
              latitude={vehicle.location.latitude}
              longitude={vehicle.location.longitude}
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedVehicle(vehicle);
              }}
            >
              <div className="relative">
                {vehicle.type === 'bike' ? (
                  <BikeIcon className={`w-8 h-8 ${statusColor} cursor-pointer`} />
                ) : (
                  <Zap className={`w-8 h-8 ${statusColor} cursor-pointer`} />
                )}
                <div className={`absolute -top-1 -right-1 w-3 h-3 ${healthDotColor} rounded-full border-2 border-white shadow-sm`} />
              </div>
            </Marker>
          );
        })}

        {selectedVehicle && (
          <Popup
            latitude={selectedVehicle.location.latitude}
            longitude={selectedVehicle.location.longitude}
            onClose={() => setSelectedVehicle(null)}
            closeButton={false}
            closeOnClick={false}
            className="w-[400px]"
          >
            <VehicleDashboard
              vehicle={selectedVehicle}
              onClose={() => setSelectedVehicle(null)}
            />
          </Popup>
        )}
      </Map>

      {/* Main UI Container */}
      <div className="absolute inset-4 pointer-events-none">
        <div className="w-full h-full flex justify-between">
          {/* Left Side */}
          <div className="pointer-events-auto">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold mb-2">NYC Fleet Monitor</h1>
              <p className="text-gray-600">Monitoring {mockVehicles.length} vehicles</p>
              <p className="text-sm text-gray-500 mt-1">
                {viewState.zoom < 14 
                  ? 'Zoom in to see individual vehicles' 
                  : 'Showing individual vehicles'}
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col gap-4 w-96 pointer-events-auto max-h-full">
            <div className="scroll-container overflow-y-auto">
              <StatsDashboard vehicles={mockVehicles} />
              
              <div className="bg-white p-4 rounded-lg shadow-lg mt-4">
                <h2 className="text-lg font-semibold mb-2">Map Legend</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#51bbd6]"></div>
                    <span>Small cluster (&lt; 10 vehicles)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#f1f075]"></div>
                    <span>Medium cluster (10-30 vehicles)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#f28cb1]"></div>
                    <span>Large cluster (30+ vehicles)</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;