export interface Bike {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  batteryLevel: number;
  lastUpdated: string;
  status: 'available' | 'in-use' | 'maintenance';
}

export interface BatteryAlert {
  bikeId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  batteryLevel: number;
  timestamp: string;
}