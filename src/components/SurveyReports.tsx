import { useMemo } from 'react';
import { useStore } from '../store';
import type { Mission } from '../types';

export function SurveyReports() {
    const { missions, drones } = useStore();

    // Calculate organization-wide statistics
    const stats = useMemo(() => {
        const completedMissions = missions.filter(m => m.status === 'completed');
        const abortedMissions = missions.filter(m => m.status === 'aborted');
        const activeMissions = missions.filter(m => m.status === 'in-progress');

        const totalFlightTime = completedMissions.reduce((acc, m) => {
            if (m.startedAt && m.completedAt) {
                const duration = (new Date(m.completedAt).getTime() - new Date(m.startedAt).getTime()) / (1000 * 60);
                return acc + duration;
            }
            return acc + m.estimatedDuration;
        }, 0);

        const totalDistance = completedMissions.reduce((acc, m) => acc + m.distance, 0);

        const avgDuration = completedMissions.length > 0
            ? totalFlightTime / completedMissions.length
            : 0;

        const successRate = missions.length > 0
            ? (completedMissions.length / (completedMissions.length + abortedMissions.length)) * 100
            : 0;

        return {
            totalMissions: missions.length,
            completedMissions: completedMissions.length,
            abortedMissions: abortedMissions.length,
            activeMissions: activeMissions.length,
            totalFlightTime: Math.round(totalFlightTime),
            totalDistance: totalDistance.toFixed(1),
            avgDuration: avgDuration.toFixed(1),
            successRate: successRate.toFixed(1),
        };
    }, [missions]);

    const completedMissions = useMemo(() =>
        missions.filter(m => m.status === 'completed' || m.status === 'aborted')
            .sort((a, b) => {
                const dateA = new Date(a.completedAt || a.createdAt).getTime();
                const dateB = new Date(b.completedAt || b.createdAt).getTime();
                return dateB - dateA;
            }),
        [missions]
    );

    const getMissionDuration = (mission: Mission) => {
        if (mission.startedAt && mission.completedAt) {
            const duration = (new Date(mission.completedAt).getTime() - new Date(mission.startedAt).getTime()) / (1000 * 60);
            return Math.round(duration);
        }
        return mission.estimatedDuration;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'white' }}>
            <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Survey Reports & Analytics
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                    Comprehensive overview of all survey missions and organizational statistics
                </p>
            </div>

            {/* Organization-wide Statistics */}
            <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Organization-wide Statistics
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                }}>
                    <StatCard
                        label="Total Missions"
                        value={stats.totalMissions.toString()}
                        color="#3b82f6"
                    />
                    <StatCard
                        label="Completed Missions"
                        value={stats.completedMissions.toString()}
                        color="#10b981"
                    />
                    <StatCard
                        label="Active Missions"
                        value={stats.activeMissions.toString()}
                        color="#f59e0b"
                    />
                    <StatCard
                        label="Total Flight Time"
                        value={`${stats.totalFlightTime} min`}
                        color="#8b5cf6"
                    />
                    <StatCard
                        label="Total Distance"
                        value={`${stats.totalDistance} km`}
                        color="#ec4899"
                    />
                    <StatCard
                        label="Avg Mission Duration"
                        value={`${stats.avgDuration} min`}
                        color="#06b6d4"
                    />
                    <StatCard
                        label="Success Rate"
                        value={`${stats.successRate}%`}
                        color="#10b981"
                    />
                    <StatCard
                        label="Aborted Missions"
                        value={stats.abortedMissions.toString()}
                        color="#ef4444"
                    />
                </div>
            </div>

            {/* Completed Missions List */}
            <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Mission History
                </h3>
                {completedMissions.length === 0 ? (
                    <div style={{
                        backgroundColor: '#1e293b',
                        padding: '3rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #334155',
                        textAlign: 'center',
                        color: '#94a3b8',
                    }}>
                        No completed missions yet. Complete a mission to see it here.
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: '#1e293b',
                        borderRadius: '0.5rem',
                        border: '1px solid #334155',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr',
                            gap: '1rem',
                            padding: '1rem 1.5rem',
                            backgroundColor: '#334155',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            color: '#cbd5e1',
                        }}>
                            <div>Mission Name</div>
                            <div>Drone</div>
                            <div>Status</div>
                            <div>Duration</div>
                            <div>Distance</div>
                            <div>Completed</div>
                        </div>
                        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            {completedMissions.map((mission) => {
                                const drone = drones.find(d => d.id === mission.droneId);
                                return (
                                    <div
                                        key={mission.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr',
                                            gap: '1rem',
                                            padding: '1rem 1.5rem',
                                            borderBottom: '1px solid #334155',
                                            transition: 'background-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{ fontWeight: '500' }}>{mission.name}</div>
                                        <div style={{ color: '#94a3b8' }}>{drone?.name || 'Unknown'}</div>
                                        <div>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.25rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                backgroundColor: mission.status === 'completed' ? '#10b98120' : '#ef444420',
                                                color: mission.status === 'completed' ? '#10b981' : '#ef4444',
                                            }}>
                                                {mission.status === 'completed' ? 'Completed' : 'Aborted'}
                                            </span>
                                        </div>
                                        <div style={{ color: '#94a3b8' }}>{getMissionDuration(mission)} min</div>
                                        <div style={{ color: '#94a3b8' }}>{mission.distance} km</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                            {formatDate(mission.completedAt)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Individual Flight Analytics */}
            {completedMissions.length > 0 && (
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                        Detailed Flight Analytics
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {completedMissions.slice(0, 3).map((mission) => {
                            const drone = drones.find(d => d.id === mission.droneId);
                            return (
                                <div
                                    key={mission.id}
                                    style={{
                                        backgroundColor: '#1e293b',
                                        padding: '1.5rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #334155',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                                {mission.name}
                                            </h4>
                                            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                                                Drone: {drone?.name || 'Unknown'} • {formatDate(mission.completedAt)}
                                            </p>
                                        </div>
                                        <span style={{
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            backgroundColor: mission.status === 'completed' ? '#10b98120' : '#ef444420',
                                            color: mission.status === 'completed' ? '#10b981' : '#ef4444',
                                        }}>
                                            {mission.status === 'completed' ? 'Completed' : 'Aborted'}
                                        </span>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '1rem',
                                        marginTop: '1rem',
                                    }}>
                                        <DetailItem label="Flight Duration" value={`${getMissionDuration(mission)} minutes`} />
                                        <DetailItem label="Distance Covered" value={`${mission.distance} km`} />
                                        <DetailItem label="Waypoints" value={mission.waypoints.length.toString()} />
                                        <DetailItem label="Altitude" value={`${mission.parameters.altitude} m`} />
                                        <DetailItem label="Speed" value={`${mission.parameters.speed} m/s`} />
                                        <DetailItem label="Pattern" value={mission.parameters.pattern} />
                                        <DetailItem label="Overlap" value={`${mission.parameters.overlapPercentage}%`} />
                                        <DetailItem label="Progress" value={`${mission.progress.toFixed(0)}%`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid #334155',
            transition: 'transform 0.2s, box-shadow 0.2s',
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >

            <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color }}>{value}</div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div style={{
            backgroundColor: '#0f172a',
            padding: '0.75rem',
            borderRadius: '0.375rem',
        }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'white', textTransform: 'capitalize' }}>{value}</div>
        </div>
    );
}
