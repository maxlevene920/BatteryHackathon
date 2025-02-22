import React from 'react';
import { format } from 'date-fns';
import { Battery, BatteryWarning } from 'lucide-react';
import { Bike } from '../types';

interface BikeDashboardProps {
  bike: Bike;
  onClose: () => void;
}

const CRITICAL_BATTERY_THRESHOLD = 20;

export const BikeDashboard: React.FC<BikeDashboardProps> = ({ bike, onClose }) => {
  const isCritical = bike.batteryLevel <= CRITICAL_BATTERY_THRESHOLD;

  const getBatteryColor = (level: number) => {
    if (level <= CRITICAL_BATTERY_THRESHOLD) return 'text-red-500';
    if (level <= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const alertAuthorities = () => {
    // In a real application, this would make an API call to alert authorities
    console.log('Alerting authorities for bike:', bike.id);
  };

  React.useEffect(() => {
    if (isCritical) {
      alertAuthorities();
    }
  }, [isCritical]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Bike Status</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Battery Level</span>
          <div className="flex items-center">
            {isCritical ? (
              <BatteryWarning className="w-6 h-6 text-red-500 mr-2" />
            ) : (
              <Battery className={`w-6 h-6 ${getBatteryColor(bike.batteryLevel)} mr-2`} />
            )}
            <span className={`font-bold ${getBatteryColor(bike.batteryLevel)}`}>
              {bike.batteryLevel}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status</span>
          <span className="capitalize font-medium">{bike.status}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Last Updated</span>
          <span className="font-medium">
            {format(new Date(bike.lastUpdated), 'PPp')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Location</span>
          <span className="font-medium">
            {bike.location.latitude.toFixed(4)}, {bike.location.longitude.toFixed(4)}
          </span>
        </div>

        {isCritical && (
          <div className="mt-4 p-4 bg-red-100 rounded-md">
            <p className="text-red-700 font-medium">
              Critical battery level! Authorities have been notified.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};