import React from 'react';
import { 
  Battery, 
  Clock, 
  MapPin, 
  Tag, 
  Activity, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Flame,
  Thermometer,
  Zap,
  AlertOctagon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Vehicle, BatteryRiskLevel } from '../types';

interface VehicleDashboardProps {
  vehicle: Vehicle;
  onClose: () => void;
}

const getBatteryColor = (level: number) => {
  if (level <= 20) return 'text-red-500';
  if (level <= 50) return 'text-yellow-500';
  return 'text-green-500';
};

const getStatusColor = (status: Vehicle['status']) => {
  switch (status) {
    case 'available':
      return 'text-green-500';
    case 'in-use':
      return 'text-blue-500';
    case 'maintenance':
      return 'text-orange-500';
    default:
      return 'text-gray-500';
  }
};

const getStatusIcon = (status: Vehicle['status']) => {
  switch (status) {
    case 'available':
      return <CheckCircle className="w-5 h-5" />;
    case 'in-use':
      return <Activity className="w-5 h-5" />;
    case 'maintenance':
      return <Settings className="w-5 h-5" />;
    default:
      return <AlertTriangle className="w-5 h-5" />;
  }
};

const getBatteryRiskColor = (riskLevel: BatteryRiskLevel) => {
  switch (riskLevel) {
    case 'low':
      return 'text-green-500';
    case 'moderate':
      return 'text-yellow-500';
    case 'high':
      return 'text-orange-500';
    case 'critical':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

const getBatteryRiskIcon = (riskLevel: BatteryRiskLevel) => {
  switch (riskLevel) {
    case 'low':
      return <CheckCircle className="w-5 h-5" />;
    case 'moderate':
      return <AlertTriangle className="w-5 h-5" />;
    case 'high':
      return <Flame className="w-5 h-5" />;
    case 'critical':
      return <AlertOctagon className="w-5 h-5" />;
    default:
      return <AlertTriangle className="w-5 h-5" />;
  }
};

export const VehicleDashboard: React.FC<VehicleDashboardProps> = ({ vehicle, onClose }) => {
  const batteryColor = getBatteryColor(vehicle.batteryLevel);
  const statusColor = getStatusColor(vehicle.status);
  const timeAgo = formatDistanceToNow(new Date(vehicle.lastUpdated), { addSuffix: true });

  const riskColor = getBatteryRiskColor(vehicle.batteryHealth.riskLevel);

  const getVehicleEmoji = (type: Vehicle['type']) => {
    switch (type) {
      case 'bike':
        return '🚲';
      case 'scooter':
        return '🛴';
      default:
        return '🚗';
    }
  };

  return (
    <div className="max-h-[70vh] scroll-container overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span role="img" aria-label={vehicle.type}>
                {getVehicleEmoji(vehicle.type)}
              </span>
              {vehicle.model}
              <span className="text-sm font-normal text-gray-500">#{vehicle.id}</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Battery Status Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Battery Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Charge Level */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Battery className={`w-5 h-5 ${batteryColor}`} />
                <span className={`font-semibold ${batteryColor}`}>
                  {vehicle.batteryLevel}%
                </span>
              </div>
              <div className="text-sm text-gray-600">Charge Level</div>
            </div>

            {/* Battery Health Status */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                {getBatteryRiskIcon(vehicle.batteryHealth.riskLevel)}
                <span className={`font-semibold ${riskColor}`}>
                  {vehicle.batteryHealth.riskLevel.charAt(0).toUpperCase() + 
                   vehicle.batteryHealth.riskLevel.slice(1)} Risk
                </span>
              </div>
              <div className="text-sm text-gray-600">Safety Status</div>
            </div>
          </div>

          {/* Detailed Battery Health Metrics */}
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-500" />
              Battery Health Metrics
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-gray-500" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">Temperature</div>
                  <div className={`text-sm truncate ${
                    vehicle.batteryHealth.temperature > 45 ? 'text-red-500' : 
                    vehicle.batteryHealth.temperature > 35 ? 'text-yellow-500' : 
                    'text-gray-600'
                  }`}>
                    {vehicle.batteryHealth.temperature.toFixed(1)}°C
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">Voltage Stability</div>
                  <div className="text-sm text-gray-600 truncate">
                    {vehicle.batteryHealth.voltageStability.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-500" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">Charge Cycles</div>
                  <div className="text-sm text-gray-600 truncate">
                    {vehicle.batteryHealth.cycleCount}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">Last Inspection</div>
                  <div className="text-sm text-gray-600 truncate">
                    {new Date(vehicle.batteryHealth.lastInspectionDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="font-semibold">Location</span>
            </div>
            <div className="text-sm text-gray-600">
              Lat: {vehicle.location.latitude.toFixed(6)}
              <br />
              Lng: {vehicle.location.longitude.toFixed(6)}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="font-semibold">Last Updated</span>
            </div>
            <div className="text-sm text-gray-600">
              {timeAgo}
              <br />
              <span className="text-xs text-gray-400">
                {new Date(vehicle.lastUpdated).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {vehicle.batteryHealth.riskLevel === 'critical' ? (
            <button className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              Schedule Emergency Service
            </button>
          ) : vehicle.batteryHealth.riskLevel === 'high' ? (
            <button className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              Schedule Inspection
            </button>
          ) : vehicle.status === 'maintenance' ? (
            <button className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              Mark as Available
            </button>
          ) : vehicle.batteryLevel <= 20 ? (
            <button className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
              Schedule Charging
            </button>
          ) : null}
          <button className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            View History
          </button>
        </div>
      </div>
    </div>
  );
}; 