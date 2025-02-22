import React from 'react';
import { Battery, Bike, Zap, Thermometer, AlertTriangle, Flame, AlertOctagon, CheckCircle } from 'lucide-react';
import type { Vehicle, BatteryStats } from '../types';

interface StatsDashboardProps {
  vehicles: Vehicle[];
}

const calculateStats = (vehicles: Vehicle[]): BatteryStats & {
  temperatureRisk: {
    critical: number;
    high: number;
    moderate: number;
    safe: number;
  };
  combinedHealth: {
    critical: number; // Either charge critical or health critical/high
    medium: number;  // Either charge medium or health moderate
    healthy: number; // Both charge and health good
  };
} => {
  const stats: BatteryStats & {
    temperatureRisk: {
      critical: number;
      high: number;
      moderate: number;
      safe: number;
    };
    combinedHealth: {
      critical: number;
      medium: number;
      healthy: number;
    };
  } = {
    totalVehicles: vehicles.length,
    averageBatteryLevel: 0,
    criticalBatteryCount: 0,
    mediumBatteryCount: 0,
    healthyBatteryCount: 0,
    byVehicleType: {
      bikes: 0,
      scooters: 0,
    },
    byStatus: {
      available: 0,
      'in-use': 0,
      maintenance: 0,
    },
    temperatureRisk: {
      critical: 0,
      high: 0,
      moderate: 0,
      safe: 0,
    },
    combinedHealth: {
      critical: 0,
      medium: 0,
      healthy: 0,
    },
  };

  vehicles.forEach(vehicle => {
    // Calculate battery level distributions
    if (vehicle.batteryLevel <= 20) {
      stats.criticalBatteryCount++;
    } else if (vehicle.batteryLevel <= 50) {
      stats.mediumBatteryCount++;
    } else {
      stats.healthyBatteryCount++;
    }

    // Calculate temperature risk distributions
    const temp = vehicle.batteryHealth.temperature;
    if (temp > 45) {
      stats.temperatureRisk.critical++;
    } else if (temp > 40) {
      stats.temperatureRisk.high++;
    } else if (temp > 35) {
      stats.temperatureRisk.moderate++;
    } else {
      stats.temperatureRisk.safe++;
    }

    // Calculate combined health status
    const isCriticalCharge = vehicle.batteryLevel <= 20;
    const isCriticalHealth = temp > 45 || temp > 40; // Critical or High temp
    const isModerateHealth = temp > 35; // Moderate temp
    const isMediumCharge = vehicle.batteryLevel <= 50;

    if (isCriticalCharge || isCriticalHealth) {
      stats.combinedHealth.critical++;
    } else if (isMediumCharge || isModerateHealth) {
      stats.combinedHealth.medium++;
    } else {
      stats.combinedHealth.healthy++;
    }

    // Calculate vehicle type counts
    stats.byVehicleType[vehicle.type === 'bike' ? 'bikes' : 'scooters']++;

    // Calculate status counts
    stats.byStatus[vehicle.status]++;

    // Add to average
    stats.averageBatteryLevel += vehicle.batteryLevel;
  });

  // Calculate final average
  stats.averageBatteryLevel = Math.round(stats.averageBatteryLevel / vehicles.length);

  return stats;
};

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ vehicles }) => {
  const stats = calculateStats(vehicles);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Fleet Statistics</h2>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Battery Health Section */}
        <div className="col-span-2">
          <h3 className="text-lg font-semibold mb-3">Battery Health</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Battery className="w-6 h-6" />
                <Thermometer className="w-5 h-5 text-gray-500" />
              </div>
              <div className="text-2xl font-bold">{stats.averageBatteryLevel}%</div>
              <div className="text-sm text-gray-600">Average</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center relative">
              <div className="flex justify-center items-center gap-2 mb-2">
                <div className="relative">
                  <Battery className="w-6 h-6 text-red-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </div>
                <div className="relative">
                  <AlertOctagon className="w-5 h-5 text-red-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </div>
              </div>
              <div className="text-2xl font-bold text-red-500">{stats.combinedHealth.critical}</div>
              <div className="text-sm text-gray-600">Critical</div>
              <div className="text-xs text-gray-500 mt-1">Charge or Health Critical</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                <div className="relative">
                  <Battery className="w-6 h-6 text-yellow-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full" />
                </div>
                <div className="relative">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full" />
                </div>
              </div>
              <div className="text-2xl font-bold text-yellow-500">{stats.combinedHealth.medium}</div>
              <div className="text-sm text-gray-600">Medium</div>
              <div className="text-xs text-gray-500 mt-1">Charge or Health Warning</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                <div className="relative">
                  <Battery className="w-6 h-6 text-green-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div className="relative">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                </div>
              </div>
              <div className="text-2xl font-bold text-green-500">{stats.combinedHealth.healthy}</div>
              <div className="text-sm text-gray-600">Healthy</div>
              <div className="text-xs text-gray-500 mt-1">Charge and Health Good</div>
            </div>
          </div>
        </div>

        {/* Temperature Risk Section */}
        <div className="col-span-2">
          <h3 className="text-lg font-semibold mb-3">Temperature Risk Distribution</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <AlertOctagon className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold text-red-500">{stats.temperatureRisk.critical}</div>
              <div className="text-sm text-gray-600">Critical</div>
              <div className="text-xs text-gray-500">&gt;45°C</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-orange-500">{stats.temperatureRisk.high}</div>
              <div className="text-sm text-gray-600">High</div>
              <div className="text-xs text-gray-500">&gt;40°C</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold text-yellow-500">{stats.temperatureRisk.moderate}</div>
              <div className="text-sm text-gray-600">Moderate</div>
              <div className="text-xs text-gray-500">&gt;35°C</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <Thermometer className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-500">{stats.temperatureRisk.safe}</div>
              <div className="text-sm text-gray-600">Safe</div>
              <div className="text-xs text-gray-500">≤35°C</div>
            </div>
          </div>
        </div>

        {/* Vehicle Types Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Vehicle Types</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5" />
                <span>Bikes</span>
              </div>
              <span className="font-bold">{stats.byVehicleType.bikes}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>Scooters</span>
              </div>
              <span className="font-bold">{stats.byVehicleType.scooters}</span>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-green-50 p-3 rounded">
              <span>Available</span>
              <span className="font-bold">{stats.byStatus.available}</span>
            </div>
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
              <span>In Use</span>
              <span className="font-bold">{stats.byStatus['in-use']}</span>
            </div>
            <div className="flex items-center justify-between bg-orange-50 p-3 rounded">
              <span>Maintenance</span>
              <span className="font-bold">{stats.byStatus.maintenance}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 