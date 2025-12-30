import { create } from 'zustand';
import type { Drone, Mission } from './types';

/**
 * Application state interface
 * Manages global state for drones and missions
 */
interface AppState {
    /** Array of all drones in the fleet */
    drones: Drone[];
    /** Array of all missions */
    missions: Mission[];
    /** Currently selected mission for viewing */
    selectedMission: Mission | null;

    /** Set the complete drones array */
    setDrones: (drones: Drone[]) => void;
    /** Set the complete missions array */
    setMissions: (missions: Mission[]) => void;
    /** Add a new mission to the array */
    addMission: (mission: Mission) => void;
    /** Update specific fields of a mission */
    updateMission: (id: string, updates: Partial<Mission>) => void;
    /** Set the currently selected mission */
    setSelectedMission: (mission: Mission | null) => void;
    /** Update a drone's operational status */
    updateDroneStatus: (id: string, status: Drone['status']) => void;
    /** Update a drone's battery level */
    updateDroneBattery: (id: string, battery: number) => void;
}

/**
 * Global application store using Zustand
 * Provides centralized state management for drones and missions
 */
export const useStore = create<AppState>((set) => ({
    drones: [],
    missions: [],
    selectedMission: null,

    setDrones: (drones) => set({ drones }),

    setMissions: (missions) => set({ missions }),

    addMission: (mission) => set((state) => ({
        missions: [...state.missions, mission]
    })),

    updateMission: (id, updates) => set((state) => ({
        missions: state.missions.map((m) =>
            m.id === id ? { ...m, ...updates } : m
        ),
    })),

    setSelectedMission: (mission) => set({ selectedMission: mission }),

    updateDroneStatus: (id, status) => set((state) => ({
        drones: state.drones.map((d) =>
            d.id === id ? { ...d, status } : d
        ),
    })),

    updateDroneBattery: (id, battery) => set((state) => ({
        drones: state.drones.map((d) =>
            d.id === id ? { ...d, batteryLevel: battery } : d
        ),
    })),
}));