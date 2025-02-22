export type VehicleType = 'bike' | 'scooter';

export type BatteryRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface BatteryHealth {
  riskLevel: BatteryRiskLevel;
  temperature: number; // in Celsius
  cycleCount: number;
  lastInspectionDate: string;
  voltageStability: number; // percentage of stability
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  location: {
    latitude: number;
    longitude: number;
  };
  batteryLevel: number;
  batteryHealth: BatteryHealth;
  lastUpdated: string;
  status: 'available' | 'in-use' | 'maintenance';
  model: string;
}

export interface BatteryStats {
  totalVehicles: number;
  averageBatteryLevel: number;
  criticalBatteryCount: number;
  mediumBatteryCount: number;
  healthyBatteryCount: number;
  byVehicleType: {
    bikes: number;
    scooters: number;
  };
  byStatus: {
    available: number;
    'in-use': number;
    maintenance: number;
  };
}

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