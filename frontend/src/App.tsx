import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PointerSparkles } from './components/PointerSparkles';
import { AITourGuide } from './components/AITourGuide';
import { HomeOverview } from './components/HomeOverview';
import { StudentView } from './components/StudentView';
import { StaffView } from './components/StaffView';
import { WardenView } from './components/WardenView';
import { FoodWasteSimulator } from './components/FoodWasteSimulator';
import { SettingsView } from './components/SettingsView';

export type ActiveTab = 'overview' | 'student' | 'staff' | 'warden' | 'simulation' | 'settings';

const AppContent: React.FC = () => {
  const { kitchenName, organizationName } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  // Check live FastAPI backend health on mount
  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not healthy');
      })
      .then((data) => {
        if (data.status === 'healthy') {
          setBackendHealthy(true);
        }
      })
      .catch(() => {
        setBackendHealthy(false);
      });
  }, []);

  return (
    <div className="space-bg">
      {/* 1. Pointer Sparkling Cursor Trail Effect */}
      <PointerSparkles />

      {/* 2. Cyber 3D Floor Perspective Grid */}
      <div className="cyber-floor" aria-hidden="true" />

      {/* 3. Floating Spatial Navigation Header */}
      <header
        style={{
          position: 'relative',
          zIndex: 20,
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        {/* Brand Logo & Name (Replicating exact logo from older MessPulse) */}
        <div
          onClick={() => setActiveTab('overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          {/* Authentic MessPulse Logo from original version */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(27, 51, 41, 0.45)',
              border: '1.5px solid rgba(79, 137, 101, 0.4)'
            }}
          >
            <img src="/icon.svg" alt="MessPulse Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: 'var(--foreground)'
                }}
              >
                MessPulse
              </span>
              <span
                style={{
                  background: 'linear-gradient(180deg, #4F8965 0%, #2E533C 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  boxShadow: '0 2px 6px rgba(46, 83, 60, 0.3)'
                }}
              >
                SPATIAL
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', fontWeight: 500, marginTop: '1px' }}>
              {kitchenName} Kitchen · {organizationName}
            </div>
          </div>
        </div>

        {/* Floating Role Tabs Bar */}
        <nav
          id="tour-roles"
          className="mirror"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px',
            borderRadius: '9999px'
          }}
        >
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'student', label: 'Student' },
              { id: 'staff', label: 'Staff' },
              { id: 'warden', label: 'Warden' },
              { id: 'simulation', label: 'Simulator 🧪' },
              { id: 'settings', label: 'Settings ⚙️' }
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  boxShadow: isActive ? '0 0 20px var(--primary)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Live Backend Connection Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.76rem',
            color: 'var(--muted-foreground)'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: backendHealthy ? '#22c55e' : '#eab308',
              boxShadow: `0 0 8px ${backendHealthy ? '#22c55e' : '#eab308'}`
            }}
          />
          <span>
            {backendHealthy
              ? 'FastAPI Backend (8000)'
              : 'Interactive Twin'}
          </span>
        </div>
      </header>

      {/* 4. Active Main View Container with Generous Bottom Padding (No Overlaps!) */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '24px 24px 140px 24px'
        }}
      >
        {activeTab === 'overview' && <HomeOverview onSelectTab={setActiveTab} />}
        {activeTab === 'student' && <StudentView />}
        {activeTab === 'staff' && <StaffView />}
        {activeTab === 'warden' && <WardenView />}
        {activeTab === 'simulation' && <FoodWasteSimulator />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* 5. Clean Footer */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          paddingBottom: '36px',
          fontSize: '0.8rem',
          color: 'var(--muted-foreground)'
        }}
      >
        <p>
          MessPulse Dark — Spatial Zero-Waste PWA · {kitchenName} Mess · {organizationName}
        </p>
        <p style={{ marginTop: '4px', fontSize: '0.74rem', opacity: 0.7 }}>
          Active Port: 5174 · All edits customizable in Settings
        </p>
      </footer>

      {/* 6. AI Tour Guide Avatar & Multi-Step Spotlight System */}
      <AITourGuide currentTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
