import type { Drone } from '../types';
import { useStore } from '../store';

export const FleetDashboard = () => {
    const drones = useStore((state) => state.drones);

    return (
        <div style={{ color: 'white' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Fleet Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {drones.map((drone: Drone) => (
                    <div
                        key={drone.id}
                        style={{
                            backgroundColor: '#1e293b',
                            padding: '1.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #334155'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{drone.name}</h3>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                backgroundColor: drone.status === 'available' ? '#059669' :
                                    drone.status === 'in-mission' ? '#2563eb' :
                                        drone.status === 'charging' ? '#d97706' : '#dc2626',
                                color: 'white'
                            }}>
                                {drone.status}
                            </span>
                        </div>
                        <div style={{ display: 'grid', gap: '0.5rem', color: '#cbd5e1' }}>
                            <div>Model: {drone.model}</div>
                            <div>Battery: {drone.batteryLevel}%</div>
                            <div>Location: {drone.location.lat.toFixed(4)}, {drone.location.lng.toFixed(4)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};