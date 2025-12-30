import { create } from 'zustand';
import type { Drone, Mission } from './types';

interface AppState {
    drones: Drone[];
    missions: Mission[];
    selectedMission: Mission | null;
    setDrones: (drones: Drone[]) => void;
    setMissions: (missions: Mission[]) => void;
    addMission: (mission: Mission) => void;
    updateMission: (id: string, updates: Partial<Mission>) => void;
    setSelectedMission: (mission: Mission | null) => void;
    updateDroneStatus: (id: string, status: Drone['status']) => void;
    updateDroneBattery: (id: string, battery: number) => void;
}

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