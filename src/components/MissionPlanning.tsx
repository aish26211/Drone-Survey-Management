import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon } from 'react-leaflet';
import { useStore } from '../store';
import type { Mission, Waypoint } from '../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function MissionPlanning() {
    const drones = useStore((state) => state.drones);
    const addMission = useStore((state) => state.addMission);
    const [missionName, setMissionName] = useState('');
    const [selectedDrone, setSelectedDrone] = useState('');
    const [altitude, setAltitude] = useState(50);
    const [speed, setSpeed] = useState(5);
    const [overlap, setOverlap] = useState(70);
    const [pattern, setPattern] = useState<'crosshatch' | 'perimeter'>('crosshatch');
    const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

    const availableDrones = drones.filter(d => d.status === 'available');

    // Generate waypoints in crosshatch pattern
    const generateCrosshatchPattern = () => {
        const center = { lat: 37.7749, lng: -122.4194 };
        const spacing = 0.001; // Approximate spacing
        const points: Waypoint[] = [];

        // Create a grid pattern
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                points.push({
                    lat: center.lat + (i * spacing),
                    lng: center.lng + (j * spacing),
                    altitude: altitude,
                });
            }
        }

        setWaypoints(points);
    };

    // Generate waypoints in perimeter pattern
    const generatePerimeterPattern = () => {
        const center = { lat: 37.7749, lng: -122.4194 };
        const size = 0.002;
        const points: Waypoint[] = [
            { lat: center.lat, lng: center.lng, altitude },
            { lat: center.lat + size, lng: center.lng, altitude },
            { lat: center.lat + size, lng: center.lng + size, altitude },
            { lat: center.lat, lng: center.lng + size, altitude },
            { lat: center.lat, lng: center.lng, altitude }, // Close the loop
        ];

        setWaypoints(points);
    };

    const handleGeneratePattern = () => {
        if (pattern === 'crosshatch') {
            generateCrosshatchPattern();
        } else {
            generatePerimeterPattern();
        }
    };

    const handleCreateMission = () => {
        if (!missionName || !selectedDrone || waypoints.length === 0) {
            alert('Please fill all fields and generate waypoints');
            return;
        }

        const newMission: Mission = {
            id: `mission-${Date.now()}`,
            name: missionName,
            droneId: selectedDrone,
            status: 'planned',
            waypoints: waypoints,
            surveyArea: {
                type: 'polygon',
                coordinates: waypoints.map(wp => [wp.lat, wp.lng]),
            },
            parameters: {
                altitude,
                speed,
                overlapPercentage: overlap,
                pattern,
            },
            progress: 0,
            createdAt: new Date().toISOString(),
            estimatedDuration: 30,
            distance: waypoints.length * 0.1,
        };

        addMission(newMission);
        alert('Mission created successfully!');

        // Reset form
        setMissionName('');
        setWaypoints([]);
    };

    return (
        <div style={{ color: 'white', height: '100%', display: 'flex', gap: '1.5rem' }}>
            {/* Left Panel - Configuration */}
            <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Mission Planning
                </h2>

                <div style={{
                    backgroundColor: '#1e293b',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #334155',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#94a3b8' }}>
                            Mission Name
                        </label>
                        <input
                            type="text"
                            value={missionName}
                            onChange={(e) => setMissionName(e.target.value)}
                            placeholder="e.g., Warehouse Inspection"
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '0.375rem',
                                color: 'white',
                                fontSize: '0.875rem',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#94a3b8' }}>
                            Select Drone
                        </label>
                        <select
                            value={selectedDrone}
                            onChange={(e) => setSelectedDrone(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '0.375rem',
                                color: 'white',
                                fontSize: '0.875rem',
                            }}
                        >
                            <option value="">Choose a drone...</option>
                            {availableDrones.map(drone => (
                                <option key={drone.id} value={drone.id}>
                                    {drone.name} ({drone.batteryLevel}%)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#94a3b8' }}>
                            Flight Pattern
                        </label>
                        <select
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value as 'crosshatch' | 'perimeter')}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                backgroundColor: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '0.375rem',
                                color: 'white',
                                fontSize: '0.875rem',
                            }}
                        >
                            <option value="crosshatch">Crosshatch Pattern</option>
                            <option value="perimeter">Perimeter Pattern</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#94a3b8' }}>
                            Altitude: {altitude}m
                        </label>
                        <input
                            type="range"
                            min="20"
                            max="120"
                            value={altitude}
                            onChange={(e) => setAltitude(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#94a3b8' }}>
                            Speed: {speed}m/s
                        </label>
                        <input
                            type="range"
                            min="3"
                            max="15"
                            value={speed}
                            onChange={(e) => setSpeed(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#94a3b8' }}>
                            Overlap: {overlap}%
                        </label>
                        <input
                            type="range"
                            min="50"
                            max="90"
                            value={overlap}
                            onChange={(e) => setOverlap(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <button
                        onClick={handleGeneratePattern}
                        style={{
                            padding: '0.75rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                    >
                        Generate Waypoints
                    </button>

                    {waypoints.length > 0 && (
                        <div style={{
                            padding: '0.75rem',
                            backgroundColor: '#0f172a',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                        }}>
                            <div style={{ color: '#94a3b8' }}>Waypoints Generated</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                                {waypoints.length} points
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleCreateMission}
                        disabled={waypoints.length === 0 || !selectedDrone || !missionName}
                        style={{
                            padding: '0.75rem',
                            backgroundColor: waypoints.length === 0 || !selectedDrone || !missionName ? '#334155' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: waypoints.length === 0 || !selectedDrone || !missionName ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (waypoints.length > 0 && selectedDrone && missionName) {
                                e.currentTarget.style.backgroundColor = '#059669';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (waypoints.length > 0 && selectedDrone && missionName) {
                                e.currentTarget.style.backgroundColor = '#10b981';
                            }
                        }}
                    >
                        Create Mission
                    </button>
                </div>
            </div>

            {/* Right Panel - Map */}
            <div style={{
                flex: 1,
                backgroundColor: '#1e293b',
                borderRadius: '0.5rem',
                border: '1px solid #334155',
                overflow: 'hidden',
                height: 'calc(100vh - 180px)',
            }}>
                <MapContainer
                    center={[37.7749, -122.4194]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {waypoints.map((wp, idx) => (
                        <Marker key={idx} position={[wp.lat, wp.lng]}>
                            <Popup>
                                Waypoint {idx + 1}<br />
                                Altitude: {wp.altitude}m
                            </Popup>
                        </Marker>
                    ))}

                    {waypoints.length > 1 && (
                        <Polyline
                            positions={waypoints.map(wp => [wp.lat, wp.lng])}
                            color="#3b82f6"
                            weight={3}
                        />
                    )}

                    {waypoints.length > 2 && pattern === 'perimeter' && (
                        <Polygon
                            positions={waypoints.map(wp => [wp.lat, wp.lng])}
                            color="#10b981"
                            fillColor="#10b981"
                            fillOpacity={0.2}
                        />
                    )}
                </MapContainer>
            </div>
        </div>
    );
}