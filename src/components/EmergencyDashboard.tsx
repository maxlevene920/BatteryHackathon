import React from 'react';
import { AlertTriangle, AlertOctagon, Clock, MapPin, Battery, Thermometer, CheckCircle, Flame } from 'lucide-react';
import type { EmergencyIncident } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface EmergencyDashboardProps {
  incidents: EmergencyIncident[];
  onUpdateIncident: (incident: EmergencyIncident) => void;
  onFocusLocation: (latitude: number, longitude: number) => void;
}

export const EmergencyDashboard: React.FC<EmergencyDashboardProps> = ({
  incidents,
  onUpdateIncident,
  onFocusLocation
}) => {
  // Organize incidents by status and sort by temperature
  const organizedIncidents = React.useMemo(() => {
    // Get pending incidents (highest priority)
    const pending = incidents
      .filter(i => i.status === 'pending')
      .sort((a, b) => b.temperature - a.temperature);
    
    // Get responded incidents (not in pending)
    const responded = incidents
      .filter(i => i.status === 'responded')
      .sort((a, b) => b.temperature - a.temperature);
    
    // Get most recent resolved incidents
    const resolved = incidents
      .filter(i => i.status === 'resolved')
      .sort((a, b) => {
        const dateA = new Date(b.responseDetails?.resolvedAt || b.timestamp);
        const dateB = new Date(a.responseDetails?.resolvedAt || a.timestamp);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5); // Only show last 5 resolved incidents

    return {
      pending,
      responded,
      resolved
    };
  }, [incidents]);

  // Count active incidents (pending + responded)
  const activeIncidentsCount = React.useMemo(() => {
    return organizedIncidents.pending.length + organizedIncidents.responded.length;
  }, [organizedIncidents]);

  const handleRespond = (incident: EmergencyIncident) => {
    onUpdateIncident({
      ...incident,
      status: 'responded',
      responseDetails: {
        ...incident.responseDetails,
        respondedAt: new Date().toISOString()
      }
    });
  };

  const handleResolve = (incident: EmergencyIncident) => {
    onUpdateIncident({
      ...incident,
      status: 'resolved',
      responseDetails: {
        ...incident.responseDetails,
        resolvedAt: new Date().toISOString()
      }
    });
  };

  const handleViewOnMap = (incident: EmergencyIncident) => {
    onFocusLocation(incident.location.latitude, incident.location.longitude);
  };

  // Helper function to render temperature with appropriate color and icon
  const renderTemperature = (temp: number) => {
    let color = 'text-gray-500';
    let icon = <Thermometer className="w-4 h-4" />;
    
    if (temp >= 150) {
      color = 'text-red-600 font-bold';
      icon = <AlertOctagon className="w-4 h-4" />;
    } else if (temp > 45) {
      color = 'text-red-500';
      icon = <Flame className="w-4 h-4" />;
    }
    
    return (
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-sm">
          {temp.toFixed(1)}°C
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <AlertOctagon className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-bold">Emergency Response Center</h2>
        <div className="ml-auto text-sm text-gray-500">
          {activeIncidentsCount} Active Cases
        </div>
      </div>

      {/* Active (Pending) Incidents */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Pending Response ({organizedIncidents.pending.length})
        </h3>
        <div className="space-y-4">
          {organizedIncidents.pending.map(incident => (
            <div
              key={incident.id}
              className="border border-red-200 rounded-lg p-4 bg-red-50"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold">Incident #{incident.id}</div>
                  <div className="text-sm text-gray-600">
                    Vehicle #{incident.vehicleId}
                  </div>
                </div>
                <div className="px-2 py-1 bg-red-500 text-white text-sm rounded">
                  PENDING
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {renderTemperature(incident.temperature)}
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-red-500" />
                  <span className="text-sm">{incident.batteryLevel}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {incident.location.latitude.toFixed(4)},
                    {incident.location.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(incident.timestamp), {
                      addSuffix: true
                    })}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRespond(incident)}
                  className="flex-1 bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition-colors"
                >
                  Mark Responded
                </button>
                <button
                  onClick={() => handleViewOnMap(incident)}
                  className="bg-red-100 text-red-700 py-2 px-4 rounded hover:bg-red-200 transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  View
                </button>
              </div>
            </div>
          ))}
          {organizedIncidents.pending.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              No pending incidents
            </div>
          )}
        </div>
      </div>

      {/* In Progress (Responded) Incidents */}
      {organizedIncidents.responded.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            In Progress ({organizedIncidents.responded.length})
          </h3>
          <div className="space-y-4">
            {organizedIncidents.responded.map(incident => (
              <div
                key={incident.id}
                className="border border-orange-200 rounded-lg p-4 bg-orange-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold">Incident #{incident.id}</div>
                    <div className="text-sm text-gray-600">
                      Vehicle #{incident.vehicleId}
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-orange-500 text-white text-sm rounded">
                    IN PROGRESS
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {renderTemperature(incident.temperature)}
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">{incident.batteryLevel}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {incident.location.latitude.toFixed(4)},
                      {incident.location.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      Responded {formatDistanceToNow(new Date(incident.responseDetails?.respondedAt || incident.timestamp), {
                        addSuffix: true
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve(incident)}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleViewOnMap(incident)}
                    className="bg-orange-100 text-orange-700 py-2 px-4 rounded hover:bg-orange-200 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Incidents */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Recent Resolved Incidents ({organizedIncidents.resolved.length})
        </h3>
        <div className="space-y-2">
          {organizedIncidents.resolved.map(incident => (
            <div
              key={incident.id}
              className="border border-gray-200 rounded-lg p-3 bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Incident #{incident.id}</div>
                  <div className="text-sm text-gray-600">
                    Vehicle #{incident.vehicleId} • {incident.temperature.toFixed(1)}°C
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Resolved{' '}
                  {formatDistanceToNow(
                    new Date(incident.responseDetails?.resolvedAt || incident.timestamp),
                    { addSuffix: true }
                  )}
                </div>
              </div>
            </div>
          ))}
          {organizedIncidents.resolved.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              No resolved incidents
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 