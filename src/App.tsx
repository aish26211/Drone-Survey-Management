import { useEffect, useState } from 'react';
import { useStore } from './store';
import { mockDrones, mockMissions } from './mockData';
import { FleetDashboard } from './components/FleetDashboard';
import { MissionPlanning } from './components/MissionPlanning';
import { LiveMonitoring } from './components/LiveMonitoring';
import { SurveyReports } from './components/SurveyReports';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planning' | 'monitoring' | 'reports'>('dashboard');
  const setDrones = useStore((state) => state.setDrones);
  const setMissions = useStore((state) => state.setMissions);

  useEffect(() => {
    setDrones(mockDrones);
    setMissions(mockMissions);
  }, [setDrones, setMissions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <header style={{
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            🚁 Drone Survey Management
          </h1>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            FlytBase Assignment 2025
          </div>
        </div>
      </header>

      <nav style={{
        backgroundColor: '#334155',
        padding: '0 2rem',
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #475569',
      }}>
        {[
          { id: 'dashboard', label: '📊 Fleet Dashboard' },
          { id: 'planning', label: '🗺️ Mission Planning' },
          { id: 'monitoring', label: '📡 Live Monitoring' },
          { id: 'reports', label: '📈 Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: activeTab === tab.id ? '#1e293b' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#cbd5e1',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: activeTab === tab.id ? '600' : '400',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = '#475569';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#cbd5e1';
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#0f172a',
        padding: '2rem',
      }}>
        {activeTab === 'dashboard' && <FleetDashboard />}
        {activeTab === 'planning' && <MissionPlanning />}
        {activeTab === 'monitoring' && <LiveMonitoring />}
        {activeTab === 'reports' && <SurveyReports />}
      </main>
    </div>
  );
}

export default App;