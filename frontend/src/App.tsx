import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { QuickTour } from './components/QuickTour';

// Pages
import { LandingPage } from './pages/public/LandingPage';
import { PublicWastePage } from './pages/public/PublicWastePage';
import { StudentToday } from './pages/student/StudentToday';
import { StudentSkip } from './pages/student/StudentSkip';
import { StudentImpact } from './pages/student/StudentImpact';
import { StaffDailyEntry } from './pages/staff/StaffDailyEntry';
import { StaffExpectedHeadcount } from './pages/staff/StaffExpectedHeadcount';
import { StaffMenuEditor } from './pages/staff/StaffMenuEditor';
import { WardenOverview } from './pages/warden/WardenOverview';
import { WardenWasteDashboard } from './pages/warden/WardenWasteDashboard';
import { WardenRatingsDashboard } from './pages/warden/WardenRatingsDashboard';
import { ActionsTrackerPage } from './pages/actions/ActionsTrackerPage';
import { HelpPage } from './pages/help/HelpPage';
import { LoginPage } from './pages/auth/LoginPage';

export const App: React.FC = () => {
  const [tourOpen, setTourOpen] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="spatial-canvas">
          {/* Ambient Spatial Lighting Orbs */}
          <div className="spatial-orb spatial-orb-1" />
          <div className="spatial-orb spatial-orb-2" />
          <div className="spatial-orb spatial-orb-3" />

          {/* Top Glass Header */}
          <Navbar onStartTour={() => setTourOpen(true)} />

          {/* Main App Content Body */}
          <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage onStartTour={() => setTourOpen(true)} />} />
              <Route path="/public-waste" element={<PublicWastePage />} />
              <Route path="/actions" element={<ActionsTrackerPage />} />
              <Route path="/help" element={<HelpPage onStartTour={() => setTourOpen(true)} />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Student Routes */}
              <Route path="/student" element={<StudentToday />} />
              <Route path="/student/skip" element={<StudentSkip />} />
              <Route path="/student/impact" element={<StudentImpact />} />

              {/* Staff Routes */}
              <Route path="/staff" element={<StaffDailyEntry />} />
              <Route path="/staff/expected" element={<StaffExpectedHeadcount />} />
              <Route path="/staff/menu" element={<StaffMenuEditor />} />

              {/* Warden & Admin Routes */}
              <Route path="/warden" element={<WardenOverview />} />
              <Route path="/warden/waste" element={<WardenWasteDashboard />} />
              <Route path="/warden/ratings" element={<WardenRatingsDashboard />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Floating Mobile-First Glass Navigation */}
          <BottomNav />

          {/* Onboarding Walkthrough Overlay */}
          <QuickTour isOpen={tourOpen} onClose={() => setTourOpen(false)} />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
