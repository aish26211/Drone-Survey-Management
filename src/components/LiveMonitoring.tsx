import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { useStore } from '../store';
import type { Mission } from '../types';
import L from 'leaflet';

const droneIcon = new L.DivIcon({
    className: 'custom-drone-icon',
    html: `<div style="
    width: 24px;
    height: 24px;
    background-color: #3b82f6;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
    animation: pulse 1s infinite;
  "></div>
  <style>
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  </style>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
});

export function LiveMonitoring() {
    const { missions, updateMission, drones, updateDroneStatus } = useStore();
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
    const animationRef = useRef<number | undefined>(undefined);
    const selectedMissionRef = useRef<Mission | null>(null);

    const activeMissions = missions.filter(m => m.status === 'in-progress' || m.status === 'planned');

    // Keep ref updated
    useEffect(() => {
        selectedMissionRef.current = selectedMission;
    }, [selectedMission]);

    const startMission = (mission: Mission) => {
        console.log('Starting mission:', mission.name);

        if (mission.status === 'planned') {
            updateMission(mission.id, {
                status: 'in-progress',
                startedAt: new Date().toISOString(),
                progress: 0,
            });
            updateDroneStatus(mission.droneId, 'in-mission');
        }

        const updatedMission = missions.find(m => m.id === mission.id) || mission;
        setSelectedMission({ ...updatedMission, status: 'in-progress', progress: 0 });
        setCurrentWaypointIndex(0);
        setCurrentPosition(mission.waypoints[0]);
    };

    const pauseMission = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };

    const abortMission = (mission: Mission) => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        updateMission(mission.id, {
            status: 'aborted',
            completedAt: new Date().toISOString(),
        });
        updateDroneStatus(mission.droneId, 'available');
        setSelectedMission(null);
        setCurrentPosition(null);
    };

    // Animation effect
    useEffect(() => {
        const mission = selectedMissionRef.current;

        if (!mission || mission.status !== 'in-progress') {
            return;
        }

        const waypoints = mission.waypoints;

        if (currentWaypointIndex >= waypoints.length - 1) {
            console.log('Mission complete!');
            updateMission(mission.id, {
                status: 'completed',
                progress: 100,
                completedAt: new Date().toISOString(),
            });
            updateDroneStatus(mission.droneId, 'available');
            return;
        }

        const start = waypoints[currentWaypointIndex];
        const end = waypoints[currentWaypointIndex + 1];
        const duration = 3000; // 3 seconds per waypoint
        const startTime = Date.now();

        console.log(`Animating from waypoint ${currentWaypointIndex} to ${currentWaypointIndex + 1}`);

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const lat = start.lat + (end.lat - start.lat) * progress;
            const lng = start.lng + (end.lng - start.lng) * progress;

            setCurrentPosition({ lat, lng });

            const overallProgress = ((currentWaypointIndex + progress) / (waypoints.length - 1)) * 100;

            if (Math.abs(overallProgress - mission.progress) > 0.5) {
                updateMission(mission.id, { progress: overallProgress });
            }

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                console.log('Waypoint reached, moving to next');
                setCurrentWaypointIndex(prev => prev + 1);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [currentWaypointIndex, selectedMission]);

    const getEstimatedTimeRemaining = (mission: Mission) => {
        const remaining = mission.estimatedDuration * (1 - mission.progress / 100);
        return Math.ceil(remaining);
    };

    const getCompletedPath = () => {
        if (!selectedMission || !currentPosition || currentWaypointIndex === 0) {
            return [];
        }

        const positions: [number, number][] = [];
        for (let i = 0; i < currentWaypointIndex; i++) {
            positions.push([selectedMission.waypoints[i].lat, selectedMission.waypoints[i].lng]);
        }
        positions.push([currentPosition.lat, currentPosition.lng]);
        return positions;
    };

    return (
        <div style={{ display: 'flex', height: '100%', gap: '1.5rem', color: 'white' }}>
            {/* Left - Map */}
            <div style={{
                flex: 1,
                backgroundColor: '#1e293b',
                borderRadius: '0.5rem',
                border: '1px solid #334155',
                overflow: 'hidden',
                height: 'calc(100vh - 180px)',
            }}>
                {selectedMission ? (
                    <MapContainer
                        key={selectedMission.id}
                        center={[selectedMission.waypoints[0].lat, selectedMission.waypoints[0].lng]}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Polyline
                            positions={selectedMission.waypoints.map(wp => [wp.lat, wp.lng])}
                            color="#94a3b8"
                            weight={2}
                            dashArray="5, 10"
                        />

                        {selectedMission.waypoints.map((wp, idx) => (
                            <Marker key={idx} position={[wp.lat, wp.lng]}>
                                <Popup>Waypoint {idx + 1}<br />Altitude: {wp.altitude}m</Popup>
                            </Marker>
                        ))}

                        {currentPosition && (
                            <Marker position={[currentPosition.lat, currentPosition.lng]} icon={droneIcon}>
                                <Popup>Drone Position<br />Progress: {selectedMission.progress.toFixed(1)}%</Popup>
                            </Marker>
                        )}

                        {getCompletedPath().length > 0 && (
                            <Polyline positions={getCompletedPath()} color="#10b981" weight={3} />
                        )}
                    </MapContainer>
                ) : (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                    }}>
                        Select a mission to view on map
                    </div>
                )}
            </div>

            {/* Right - Mission List */}
            <div style={{
                width: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                paddingRight: '1rem',
            }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>
                        Active Drones
                    </h3>
                    <div style={{
                        backgroundColor: '#1e293b',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #334155',
                    }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                            {drones.filter(d => d.status === 'in-mission').length} active
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>
                        Active Missions
                    </h3>

                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        overflowY: 'auto',
                    }}>
                        {activeMissions.length === 0 ? (
                            <div style={{
                                backgroundColor: '#1e293b',
                                padding: '2rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #334155',
                                textAlign: 'center',
                                color: '#94a3b8',
                            }}>
                                No active missions.<br />Create one in Planning tab.
                            </div>
                        ) : (
                            activeMissions.map(mission => {
                                const drone = drones.find(d => d.id === mission.droneId);
                                const isSelected = selectedMission?.id === mission.id;

                                return (
                                    <div
                                        key={mission.id}
                                        style={{
                                            backgroundColor: isSelected ? '#334155' : '#1e293b',
                                            padding: '1rem',
                                            borderRadius: '0.5rem',
                                            border: `2px solid ${isSelected ? '#3b82f6' : '#334155'}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onClick={() => {
                                            console.log('Mission clicked:', mission.name);
                                            setSelectedMission(mission);
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'white' }}>
                                            {mission.name}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                                            Drone: {drone?.name || 'Unknown'}
                                        </div>

                                        <div style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: mission.status === 'in-progress' ? '#3b82f620' : '#f59e0b20',
                                            color: mission.status === 'in-progress' ? '#3b82f6' : '#f59e0b',
                                            marginBottom: '0.75rem',
                                        }}>
                                            {mission.status === 'in-progress' ? 'In Progress' : 'Planned'}
                                        </div>

                                        {mission.status === 'in-progress' && (
                                            <>
                                                <div style={{
                                                    width: '100%',
                                                    height: '6px',
                                                    backgroundColor: '#0f172a',
                                                    borderRadius: '3px',
                                                    overflow: 'hidden',
                                                    marginBottom: '0.5rem',
                                                }}>
                                                    <div style={{
                                                        width: `${mission.progress}%`,
                                                        height: '100%',
                                                        backgroundColor: '#3b82f6',
                                                        transition: 'width 0.3s',
                                                    }} />
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                    {mission.progress.toFixed(1)}% • ~{getEstimatedTimeRemaining(mission)} min
                                                </div>
                                            </>
                                        )}

                                        {mission.status === 'planned' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Start mission clicked:', mission.name);
                                                    startMission(mission);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    marginTop: '0.5rem',
                                                    backgroundColor: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Start Mission
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {selectedMission && selectedMission.status === 'in-progress' && (
                    <div style={{
                        backgroundColor: '#1e293b',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #334155',
                        display: 'flex',
                        gap: '0.5rem',
                    }}>
                        <button
                            onClick={pauseMission}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Pause
                        </button>
                        <button
                            onClick={() => abortMission(selectedMission)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Abort
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}