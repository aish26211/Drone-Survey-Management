# Code Documentation - Drone Survey Management System

**Project:** Drone Survey Management System  
**Author:** Aish Sinha  
**Version:** 1.0  
**Last Updated:** December 30, 2025

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [Data Models](#data-models)
6. [State Management](#state-management)
7. [Key Features Implementation](#key-features-implementation)
8. [API Reference](#api-reference)
9. [Setup and Installation](#setup-and-installation)

---

## 1. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Fleet      │  │   Mission    │  │    Live      │  │
│  │  Dashboard   │  │   Planning   │  │  Monitoring  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐                                       │
│  │   Survey     │                                       │
│  │   Reports    │                                       │
│  └──────────────┘                                       │
├─────────────────────────────────────────────────────────┤
│              Zustand State Management                    │
├─────────────────────────────────────────────────────────┤
│         TypeScript Type Definitions & Interfaces         │
└─────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App.tsx
├── FleetDashboard.tsx
├── MissionPlanning.tsx
├── LiveMonitoring.tsx
└── SurveyReports.tsx
```

---

## 2. Technology Stack

### Frontend Framework
- **React 18.3.1** - Component-based UI library
- **TypeScript 5.6.2** - Type-safe JavaScript
- **Vite 6.0.5** - Build tool and dev server

### State Management
- **Zustand 5.0.2** - Lightweight state management

### Mapping & Visualization
- **Leaflet 1.9.4** - Interactive map library
- **React-Leaflet 4.2.1** - React components for Leaflet

### Styling
- **CSS3** - Custom styling with modern features

---

## 3. Project Structure

```
drone-survey-system/
├── src/
│   ├── components/
│   │   ├── FleetDashboard.tsx      # Drone fleet overview
│   │   ├── LiveMonitoring.tsx      # Real-time mission tracking
│   │   ├── MissionPlanning.tsx     # Mission configuration
│   │   └── SurveyReports.tsx       # Analytics and reporting
│   ├── App.tsx                     # Main application component
│   ├── App.css                     # Application styles
│   ├── main.tsx                    # Application entry point
│   ├── index.css                   # Global styles
│   ├── store.ts                    # Zustand state management
│   ├── types.ts                    # TypeScript type definitions
│   └── mockData.ts                 # Sample data
├── public/                         # Static assets
├── index.html                      # HTML template
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite config
└── README.md                       # Project documentation
```

---

## 4. Core Components

### 4.1 FleetDashboard Component

**File:** `src/components/FleetDashboard.tsx`

**Purpose:** Display organization-wide drone inventory with real-time status

**Key Features:**
- Grid layout of all drones
- Status indicators (available, in-mission, charging, maintenance)
- Battery level monitoring
- GPS location display

**State Dependencies:**
```typescript
const drones = useStore((state) => state.drones);
```

**Rendering Logic:**
- Maps through drones array
- Color-coded status badges
- Responsive grid layout

---

### 4.2 MissionPlanning Component

**File:** `src/components/MissionPlanning.tsx`

**Purpose:** Configure and create new survey missions

**Key Features:**
- Mission name input
- Drone selection dropdown
- Flight pattern selection (crosshatch/perimeter)
- Parameter configuration (altitude, speed, overlap)
- Interactive map preview
- Waypoint generation

**Pattern Generation Algorithms:**

**Crosshatch Pattern:**
```typescript
const generateCrosshatchPattern = () => {
    const center = { lat: 37.7749, lng: -122.4194 };
    const spacing = 0.001;
    const points: Waypoint[] = [];
    
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
```

**Perimeter Pattern:**
```typescript
const generatePerimeterPattern = () => {
    const center = { lat: 37.7749, lng: -122.4194 };
    const size = 0.002;
    const points: Waypoint[] = [
        { lat: center.lat, lng: center.lng, altitude },
        { lat: center.lat + size, lng: center.lng, altitude },
        { lat: center.lat + size, lng: center.lng + size, altitude },
        { lat: center.lat, lng: center.lng + size, altitude },
        { lat: center.lat, lng: center.lng, altitude },
    ];
    
    setWaypoints(points);
};
```

---

### 4.3 LiveMonitoring Component

**File:** `src/components/LiveMonitoring.tsx`

**Purpose:** Real-time mission tracking and control

**Key Features:**
- Interactive map with drone position
- Real-time animation
- Progress tracking
- Mission controls (start, pause, abort)
- Multiple concurrent mission support

**Animation System:**

The component uses `requestAnimationFrame` for smooth 60fps animation:

```typescript
const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const lat = start.lat + (end.lat - start.lat) * progress;
    const lng = start.lng + (end.lng - start.lng) * progress;
    
    setCurrentPosition({ lat, lng });
    
    const overallProgress = ((currentWaypointIndex + progress) / 
                            (waypoints.length - 1)) * 100;
    
    if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
    } else {
        setCurrentWaypointIndex(prev => prev + 1);
    }
};
```

**State Management:**
- `selectedMission` - Currently selected mission
- `currentPosition` - Drone's current GPS coordinates
- `currentWaypointIndex` - Current waypoint in flight path
- `animationRef` - Reference to animation frame

**Mission Control Functions:**

```typescript
// Start a mission
const startMission = (mission: Mission) => {
    updateMission(mission.id, {
        status: 'in-progress',
        startedAt: new Date().toISOString(),
        progress: 0,
    });
    updateDroneStatus(mission.droneId, 'in-mission');
};

// Pause a mission
const pauseMission = () => {
    if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
    }
};

// Abort a mission
const abortMission = (mission: Mission) => {
    if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
    }
    updateMission(mission.id, {
        status: 'aborted',
        completedAt: new Date().toISOString(),
    });
    updateDroneStatus(mission.droneId, 'available');
};
```

---

### 4.4 SurveyReports Component

**File:** `src/components/SurveyReports.tsx`

**Purpose:** Display analytics and mission history

**Key Features:**
- Organization-wide statistics (8 metrics)
- Mission history table
- Individual flight analytics
- Success rate calculation

**Statistics Calculation:**

```typescript
const stats = useMemo(() => {
    const completedMissions = missions.filter(m => m.status === 'completed');
    const abortedMissions = missions.filter(m => m.status === 'aborted');
    const activeMissions = missions.filter(m => m.status === 'in-progress');
    
    const totalFlightTime = completedMissions.reduce((acc, m) => {
        if (m.startedAt && m.completedAt) {
            const duration = (new Date(m.completedAt).getTime() - 
                            new Date(m.startedAt).getTime()) / (1000 * 60);
            return acc + duration;
        }
        return acc + m.estimatedDuration;
    }, 0);
    
    const totalDistance = completedMissions.reduce((acc, m) => 
        acc + m.distance, 0);
    
    const successRate = missions.length > 0
        ? (completedMissions.length / 
          (completedMissions.length + abortedMissions.length)) * 100
        : 0;
    
    return {
        totalMissions: missions.length,
        completedMissions: completedMissions.length,
        abortedMissions: abortedMissions.length,
        activeMissions: activeMissions.length,
        totalFlightTime: Math.round(totalFlightTime),
        totalDistance: totalDistance.toFixed(1),
        successRate: successRate.toFixed(1),
    };
}, [missions]);
```

---

## 5. Data Models

### 5.1 Drone Interface

**File:** `src/types.ts`

```typescript
export interface Drone {
    id: string;                    // Unique identifier
    name: string;                  // Display name
    status: 'available' | 'in-mission' | 'charging' | 'maintenance';
    batteryLevel: number;          // 0-100 percentage
    location: {
        lat: number;               // Latitude
        lng: number;               // Longitude
    };
    model: string;                 // Drone model
    lastMaintenance: string;       // ISO timestamp
}
```

### 5.2 Mission Interface

```typescript
export interface Mission {
    id: string;                    // Unique identifier
    name: string;                  // Mission name
    droneId: string;               // Assigned drone ID
    status: 'planned' | 'in-progress' | 'completed' | 'aborted';
    waypoints: Waypoint[];         // Flight path
    surveyArea: {
        type: 'polygon';
        coordinates: [number, number][];
    };
    parameters: {
        altitude: number;          // Meters
        speed: number;             // m/s
        overlapPercentage: number; // 0-100
        pattern: 'crosshatch' | 'perimeter';
    };
    progress: number;              // 0-100 percentage
    createdAt: string;             // ISO timestamp
    startedAt?: string;            // ISO timestamp
    completedAt?: string;          // ISO timestamp
    estimatedDuration: number;     // Minutes
    distance: number;              // Kilometers
}
```

### 5.3 Waypoint Interface

```typescript
export interface Waypoint {
    lat: number;                   // Latitude
    lng: number;                   // Longitude
    altitude: number;              // Meters
}
```

---

## 6. State Management

### Zustand Store

**File:** `src/store.ts`

The application uses Zustand for centralized state management:

```typescript
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
```

**Key Functions:**

- `addMission` - Adds new mission to array
- `updateMission` - Updates specific mission fields
- `updateDroneStatus` - Changes drone operational status
- `updateDroneBattery` - Updates drone battery level

---

## 7. Key Features Implementation

### 7.1 Real-Time Animation

**Implementation:** `requestAnimationFrame` API

**Flow:**
1. Mission starts → Set initial position
2. Calculate interpolation between waypoints
3. Update position on each frame (60fps)
4. Progress to next waypoint when complete
5. Update mission progress percentage

**Performance:** 60fps smooth animation with minimal CPU usage

### 7.2 Pattern Generation

**Crosshatch Pattern:**
- Grid-based waypoint distribution
- 16 waypoints in 4x4 grid
- Optimal for area coverage

**Perimeter Pattern:**
- Boundary-following waypoints
- 5 waypoints forming closed loop
- Ideal for facility inspection

### 7.3 Mission Control

**Safety Features:**
- Pause capability for intervention
- Abort for emergency stops
- Battery level monitoring
- Status validation before operations

---

## 8. API Reference

### Store Actions

#### `addMission(mission: Mission)`
Adds a new mission to the missions array.

**Parameters:**
- `mission` - Complete mission object

**Example:**
```typescript
addMission({
    id: 'mission-123',
    name: 'Warehouse Inspection',
    droneId: 'drone-1',
    status: 'planned',
    // ... other fields
});
```

#### `updateMission(id: string, updates: Partial<Mission>)`
Updates specific fields of an existing mission.

**Parameters:**
- `id` - Mission identifier
- `updates` - Object with fields to update

**Example:**
```typescript
updateMission('mission-123', {
    status: 'in-progress',
    progress: 50,
});
```

#### `updateDroneStatus(id: string, status: Drone['status'])`
Updates a drone's operational status.

**Parameters:**
- `id` - Drone identifier
- `status` - New status value

**Example:**
```typescript
updateDroneStatus('drone-1', 'in-mission');
```

---

## 9. Setup and Installation

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Installation Steps

1. **Clone repository:**
```bash
git clone https://github.com/aish26211/Drone-Survey-Management.git
cd Drone-Survey-Management
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

5. **Preview production build:**
```bash
npm run preview
```

### Environment Variables
No environment variables required for this application.

### Browser Support
- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ✅ Responsive design

---

## Performance Optimization

### Code Splitting
- Components loaded on-demand
- Lazy loading potential for large datasets

### State Optimization
- `useMemo` for expensive calculations
- Minimal re-renders with Zustand selectors

### Animation Performance
- `requestAnimationFrame` for 60fps
- Cleanup on component unmount
- Efficient position interpolation

---

## Security Considerations

### Input Validation
- Mission name required
- Drone selection required
- Parameter bounds enforced

### State Integrity
- TypeScript type safety
- Immutable state updates
- Predictable state transitions

---

## Future Enhancements

### Backend Integration
- Replace mock data with API calls
- WebSocket for real-time updates
- User authentication

### Advanced Features
- Weather data integration
- 3D terrain visualization
- Multi-user collaboration
- Advanced pathfinding algorithms

---

## Support and Contact

**Repository:** https://github.com/aish26211/Drone-Survey-Management  
**Live Demo:** https://drone-survey-management-seven.vercel.app/  
**Author:** Aish Sinha

---

**Document Version:** 1.0  
**Last Updated:** December 30, 2025
