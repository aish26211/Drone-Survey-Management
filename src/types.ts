/**
 * Represents a drone in the fleet
 */
export interface Drone {
    /** Unique identifier for the drone */
    id: string;
    /** Display name of the drone */
    name: string;
    /** Current operational status */
    status: 'available' | 'in-mission' | 'charging' | 'maintenance';
    /** Battery level percentage (0-100) */
    batteryLevel: number;
    /** Current GPS location */
    location: {
        lat: number;
        lng: number;
    };
    /** Drone model/type */
    model: string;
    /** ISO timestamp of last maintenance */
    lastMaintenance: string;
}

/**
 * Represents a waypoint in a mission flight path
 */
export interface Waypoint {
    /** Latitude coordinate */
    lat: number;
    /** Longitude coordinate */
    lng: number;
    /** Flight altitude in meters */
    altitude: number;
}

/**
 * Represents a drone survey mission
 */
export interface Mission {
    /** Unique identifier for the mission */
    id: string;
    /** Display name of the mission */
    name: string;
    /** ID of the assigned drone */
    droneId: string;
    /** Current mission status */
    status: 'planned' | 'in-progress' | 'completed' | 'aborted';
    /** Array of waypoints defining the flight path */
    waypoints: Waypoint[];
    /** Survey area definition */
    surveyArea: {
        type: 'polygon';
        coordinates: [number, number][];
    };
    /** Mission configuration parameters */
    parameters: {
        /** Flight altitude in meters */
        altitude: number;
        /** Flight speed in meters per second */
        speed: number;
        /** Image overlap percentage for comprehensive coverage */
        overlapPercentage: number;
        /** Flight pattern type */
        pattern: 'crosshatch' | 'perimeter';
    };
    /** Mission completion progress (0-100) */
    progress: number;
    /** ISO timestamp when mission was created */
    createdAt: string;
    /** ISO timestamp when mission started (optional) */
    startedAt?: string;
    /** ISO timestamp when mission completed (optional) */
    completedAt?: string;
    /** Estimated mission duration in minutes */
    estimatedDuration: number;
    /** Total flight distance in kilometers */
    distance: number;
}

/**
 * Organization-wide mission statistics
 */
export interface MissionStats {
    /** Total number of missions */
    totalMissions: number;
    /** Number of completed missions */
    completedMissions: number;
    /** Number of currently active missions */
    activeMissions: number;
    /** Total flight time across all missions in minutes */
    totalFlightTime: number;
    /** Total distance covered across all missions in kilometers */
    totalDistance: number;
}