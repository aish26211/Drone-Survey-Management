export interface Drone {
    id: string;
    name: string;
    status: 'available' | 'in-mission' | 'charging' | 'maintenance';
    batteryLevel: number;
    location: {
        lat: number;
        lng: number;
    };
    model: string;
    lastMaintenance: string;
}

export interface Waypoint {
    lat: number;
    lng: number;
    altitude: number;
}

export interface Mission {
    id: string;
    name: string;
    droneId: string;
    status: 'planned' | 'in-progress' | 'completed' | 'aborted';
    waypoints: Waypoint[];
    surveyArea: {
        type: 'polygon';
        coordinates: [number, number][];
    };
    parameters: {
        altitude: number;
        speed: number;
        overlapPercentage: number;
        pattern: 'crosshatch' | 'perimeter';
    };
    progress: number;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    estimatedDuration: number; // in minutes
    distance: number; // in kilometers
}

export interface MissionStats {
    totalMissions: number;
    completedMissions: number;
    activeMissions: number;
    totalFlightTime: number; // in minutes
    totalDistance: number; // in kilometers
}