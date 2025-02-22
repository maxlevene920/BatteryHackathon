import React, { useState, useMemo, useEffect } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl';
import { Battery, Bike as BikeIcon, Zap, AlertTriangle } from 'lucide-react';
import { VehicleDashboard } from './components/VehicleDashboard';
import { StatsDashboard } from './components/StatsDashboard';
import { EmergencyDashboard } from './components/EmergencyDashboard';
import type { Vehicle, BatteryRiskLevel, EmergencyIncident } from './types';
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

// Emergency response thresholds
const EMERGENCY_THRESHOLDS = {
  CRITICAL_TEMP: 47, // °C (increased from 45)
  HIGH_TEMP: 43, // °C (increased from 40)
  CRITICAL_VOLTAGE: 85, // % (lowered from 87)
  CRITICAL_BATTERY: 15, // % (lowered from 20)
};

const generateEmergencyIncident = (vehicle: Vehicle): EmergencyIncident => {
  return {
    id: `incident-${Date.now()}-${vehicle.id}`,
    vehicleId: vehicle.id,
    timestamp: new Date().toISOString(),
    location: vehicle.location,
    temperature: vehicle.batteryHealth.temperature,
    batteryLevel: vehicle.batteryLevel,
    riskLevel: vehicle.batteryHealth.riskLevel,
    status: 'pending'
  };
};

const generateBatteryHealth = (batteryLevel: number, cycleCount: number) => {
  // Determine risk level based on multiple factors
  let riskLevel: BatteryRiskLevel = 'low';
  
  // Adjust temperature generation to make high temperatures rarer
  // Most batteries will be between 20-35°C, with a small chance of being hotter
  const tempBase = 20 + (Math.random() * 15); // 20-35°C base temperature
  const isOverheating = Math.random() < 0.08; // 8% chance of overheating
  const temperature = isOverheating 
    ? 35 + (Math.random() * 15) // Overheating: 35-50°C
    : tempBase;
  
  // Adjust voltage stability to be generally higher
  const voltageStability = 90 + (Math.random() * 10); // 90-100%
  
  // Determine if emergency response is required
  // Make it primarily temperature-driven
  const requiresEmergencyResponse = 
    temperature > EMERGENCY_THRESHOLDS.CRITICAL_TEMP || 
    (temperature > EMERGENCY_THRESHOLDS.HIGH_TEMP && batteryLevel < EMERGENCY_THRESHOLDS.CRITICAL_BATTERY);
  
  if (
    temperature > EMERGENCY_THRESHOLDS.CRITICAL_TEMP || 
    (temperature > EMERGENCY_THRESHOLDS.HIGH_TEMP && batteryLevel < EMERGENCY_THRESHOLDS.CRITICAL_BATTERY) ||
    cycleCount > 900 // Increased from 800
  ) {
    riskLevel = 'critical';
  } else if (
    temperature > EMERGENCY_THRESHOLDS.HIGH_TEMP ||
    (batteryLevel < 25 && temperature > 38) || // Adjusted conditions
    cycleCount > 700 // Increased from 500
  ) {
    riskLevel = 'high';
  } else if (
    temperature > 38 || // Increased from 35
    batteryLevel < 30 ||
    cycleCount > 500 // Increased from 300
  ) {
    riskLevel = 'moderate';
  }

  return {
    riskLevel,
    temperature,
    cycleCount,
    lastInspectionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    voltageStability,
    requiresEmergencyResponse
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

    const type = Math.random() > 0.4 ? 'bike' : 'scooter';
    const models = type === 'bike' ? VEHICLE_MODELS.bikes : VEHICLE_MODELS.scooters;
    const model = models[Math.floor(Math.random() * models.length)];
    
    // Adjust battery level generation to favor higher levels
    const batteryLevel = Math.floor(20 + (Math.random() * Math.random() * 80)); // Tends towards higher values
    const cycleCount = Math.floor(Math.random() * 1000);
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
  const [emergencyIncidents, setEmergencyIncidents] = useState<EmergencyIncident[]>([]);
  const [viewState, setViewState] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    zoom: 11
  });

  // Get dangerous vehicles (critical temperature)
  const dangerousVehicles = useMemo(() => 
    mockVehicles.filter(v => 
      v.batteryHealth.temperature > EMERGENCY_THRESHOLDS.CRITICAL_TEMP &&
      // Only include if there's no active incident for this vehicle
      !emergencyIncidents.some(incident => 
        incident.vehicleId === v.id && 
        (incident.status === 'pending' || incident.status === 'responded')
      )
    ),
    [emergencyIncidents] // Add emergencyIncidents as dependency
  );

  // Function to focus on a specific vehicle
  const focusOnVehicle = (vehicle: Vehicle) => {
    setViewState({
      latitude: vehicle.location.latitude,
      longitude: vehicle.location.longitude,
      zoom: 16
    });
    setSelectedVehicle(vehicle);
    
    // Create a new incident for this vehicle if it doesn't already have one
    if (!emergencyIncidents.some(incident => 
      incident.vehicleId === vehicle.id && 
      (incident.status === 'pending' || incident.status === 'responded')
    )) {
      const newIncident = generateEmergencyIncident(vehicle);
      setEmergencyIncidents(prev => [...prev, newIncident]);
    }
  };

  const getBatteryColor = (level: number) => {
    if (level <= 20) return 'text-yellow-500';
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
        type: vehicle.type,
        temperature: vehicle.batteryHealth.temperature
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [vehicle.location.longitude, vehicle.location.latitude]
      }
    }))
  }), []);

  const shouldShowIndividualMarkers = viewState.zoom >= 14;

  // Monitor vehicles for emergency situations
  useEffect(() => {
    const checkForEmergencies = () => {
      mockVehicles.forEach(vehicle => {
        if (
          vehicle.batteryHealth.requiresEmergencyResponse && 
          !emergencyIncidents.some(incident => 
            incident.vehicleId === vehicle.id && 
            incident.status !== 'resolved'
          )
        ) {
          const newIncident = generateEmergencyIncident(vehicle);
          setEmergencyIncidents(prev => [...prev, newIncident]);
          
          // Log the emergency
          console.log('🚨 EMERGENCY ALERT:', {
            timestamp: new Date().toISOString(),
            vehicle: {
              id: vehicle.id,
              type: vehicle.type,
              model: vehicle.model,
              location: vehicle.location
            },
            batteryHealth: {
              temperature: vehicle.batteryHealth.temperature,
              voltageStability: vehicle.batteryHealth.voltageStability,
              batteryLevel: vehicle.batteryLevel
            },
            incidentId: newIncident.id
          });

          // Simulate automatic notification to authorities
          if (vehicle.batteryHealth.temperature > EMERGENCY_THRESHOLDS.CRITICAL_TEMP) {
            console.log('🚒 ALERTING FIRE DEPARTMENT:', {
              incidentId: newIncident.id,
              location: vehicle.location,
              temperature: vehicle.batteryHealth.temperature
            });
          }
        }
      });
    };

    // Check every 30 seconds
    const interval = setInterval(checkForEmergencies, 30000);
    checkForEmergencies(); // Initial check

    return () => clearInterval(interval);
  }, [emergencyIncidents]);

  const focusLocation = (latitude: number, longitude: number) => {
    setViewState({
      latitude,
      longitude,
      zoom: 16
    });
  };

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
                ['>', ['get', 'temperature'], EMERGENCY_THRESHOLDS.CRITICAL_TEMP], '#ef4444',
                ['<=', ['get', 'batteryLevel'], 20], '#eab308',
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
          const isCriticalTemp = vehicle.batteryHealth.temperature > EMERGENCY_THRESHOLDS.CRITICAL_TEMP;
          const isMediumCharge = vehicle.batteryLevel <= 50;
          
          let statusColor = 'text-green-500';
          let healthDotColor = 'bg-green-500';
          
          if (isCriticalTemp) {
            statusColor = 'text-red-500';
            healthDotColor = 'bg-red-500';
          } else if (isMediumCharge) {
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

      {/* Danger Zone Quick Navigation */}
      {dangerousVehicles.length > 0 && (
        <div className="absolute top-4 right-4 z-50 pointer-events-auto">
          <div className="bg-red-500 p-4 rounded-lg shadow-lg">
            <h3 className="text-white font-bold flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" />
              Critical Temperature Alerts
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {dangerousVehicles.map(vehicle => (
                <button
                  key={vehicle.id}
                  onClick={() => focusOnVehicle(vehicle)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white p-2 rounded flex items-center justify-between text-sm"
                >
                  <span>{vehicle.type === 'bike' ? '🚲' : '🛴'} #{vehicle.id}</span>
                  <span>{vehicle.batteryHealth.temperature.toFixed(1)}°C</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Alerts */}
      {emergencyIncidents.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>
              {emergencyIncidents.filter(i => i.status === 'pending').length} Active Emergency Alerts
            </span>
          </div>
        </div>
      )}

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
              
              {emergencyIncidents.length > 0 && (
                <div className="mt-4">
                  <EmergencyDashboard
                    incidents={emergencyIncidents}
                    onUpdateIncident={(updatedIncident) => {
                      setEmergencyIncidents(prev =>
                        prev.map(incident =>
                          incident.id === updatedIncident.id ? updatedIncident : incident
                        )
                      );
                      
                      // Log status changes
                      console.log(`📝 Incident ${updatedIncident.id} status updated to ${updatedIncident.status}`, {
                        timestamp: new Date().toISOString(),
                        incident: updatedIncident
                      });
                    }}
                    onFocusLocation={focusLocation}
                  />
                </div>
              )}
              
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