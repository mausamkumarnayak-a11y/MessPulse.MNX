import React from 'react';
import { useApp } from '../context/AppContext';
import { SpatialCard } from './SpatialCard';
import { AnimatedCounter } from './AnimatedCounter';
import { 
  Sparkles, ArrowRight, TrendingDown, 
  GraduationCap, Settings, Play 
} from 'lucide-react';
import type { ActiveTab } from '../App';

interface HomeOverviewProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({ onSelectTab }) => {
  const { organizationName, kitchenName } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', maxWidth: '1200px', margin: '0 auto', paddingBottom: '30px' }}>
      {/* Hero Section */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          alignItems: 'center',
          gap: '48px',
          paddingTop: '20px',
          paddingBottom: '20px'
        }}
      >
        {/* Left Column: Vision & CTAs */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(52, 211, 153, 0.1)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              marginBottom: '18px'
            }}
          >
            <Sparkles size={14} color="var(--primary)" />
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 700 }}>
              {kitchenName} Mess · {organizationName}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.4rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: 'var(--foreground)'
            }}
          >
            Feel the <span className="text-holo">pulse</span> of your mess.
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--muted-foreground)',
              lineHeight: 1.6,
              maxWidth: '520px',
              marginTop: '20px'
            }}
          >
            Rate a meal in five seconds. Skip before the cut-off. Watch measured food waste fall — and see student feedback turn into real action.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '32px' }}>
            <button
              onClick={() => onSelectTab('student')}
              className="btn-primary"
              style={{ fontSize: '1rem', padding: '14px 28px' }}
            >
              <GraduationCap size={18} /> I'm a Student
            </button>
            <button
              onClick={() => onSelectTab('simulation')}
              className="btn-secondary"
              style={{ fontSize: '1rem', padding: '14px 28px' }}
            >
              <Play size={18} fill="currentColor" /> Live Simulator
            </button>
            <button
              onClick={() => onSelectTab('settings')}
              className="btn-secondary"
              style={{ fontSize: '0.94rem', padding: '14px 20px' }}
            >
              <Settings size={17} /> Edit Settings
            </button>
          </div>
        </div>

        {/* Right Column: Clean, Non-Overlapping Spatial Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '24px',
            alignItems: 'stretch'
          }}
        >
          {/* Card 1: Waste Per Head */}
          <SpatialCard float="none" className="p-6 h-full">
            <span className="card-label">
              Waste Per Diner
            </span>
            <p className="card-stat-value" style={{ color: 'var(--primary)' }}>
              <AnimatedCounter to={21} suffix="g" />
            </p>
            <p style={{ fontSize: '0.82rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px', margin: '6px 0 0 0' }}>
              <TrendingDown size={15} /> ▼ 34% this month
            </p>
            <span className="card-subtext" style={{ marginTop: 'auto', paddingTop: '10px' }}>
              Measured daily at {kitchenName}
            </span>
          </SpatialCard>

          {/* Card 2: Expected Headcount Tonight */}
          <SpatialCard float="none" className="p-6 h-full">
            <span className="card-label">
              Expected Tonight
            </span>
            <p className="card-stat-value" style={{ color: 'var(--foreground)' }}>
              <AnimatedCounter to={382} />
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', margin: '6px 0 0 0' }}>
              students · skip-adjusted
            </p>
            <span className="card-subtext" style={{ color: 'var(--accent)', marginTop: 'auto', paddingTop: '10px' }}>
              -68 verified skips
            </span>
          </SpatialCard>

          {/* Card 3: Avg Rating (Spans all columns cleanly) */}
          <SpatialCard float="none" className="p-6 h-full" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <span className="card-label">
                  Average Student Rating
                </span>
                <p className="card-stat-value" style={{ color: '#fbbf24', margin: '4px 0 0 0' }}>
                  4.4★
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '1.9rem', flexShrink: 0 }}>
                <span title="Terrible" style={{ cursor: 'default' }}>😖</span>
                <span title="Poor" style={{ cursor: 'default' }}>😕</span>
                <span title="Okay" style={{ cursor: 'default' }}>😐</span>
                <span title="Good" style={{ cursor: 'default' }}>🙂</span>
                <span title="Delicious" style={{ cursor: 'default' }}>😍</span>
              </div>
            </div>
            <p className="card-subtext" style={{ marginTop: '12px' }}>
              Based on anonymous 5-second ratings · 5-review threshold protected
            </p>
          </SpatialCard>
        </div>
      </section>

      {/* Role Gateways Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        {/* Student Gateway */}
        <SpatialCard
          onClick={() => onSelectTab('student')}
          className="p-6 h-full"
          float="none"
          style={{ cursor: 'pointer' }}
        >
          <div style={{ fontSize: '2.4rem', marginBottom: '14px' }}>🎓</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Student Portal</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', lineHeight: 1.55, marginBottom: '20px' }}>
            View today's menu, submit 5-second anonymous ratings, skip meals with cutoff enforcement, and track your food waste savings.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', marginTop: 'auto' }}>
            <span>Enter Student View</span> <ArrowRight size={16} />
          </div>
        </SpatialCard>

        {/* Staff Gateway */}
        <SpatialCard
          onClick={() => onSelectTab('staff')}
          className="p-6 h-full"
          float="none"
          style={{ cursor: 'pointer' }}
        >
          <div style={{ fontSize: '2.4rem', marginBottom: '14px' }}>👩‍🍳</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Kitchen Staff</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', lineHeight: 1.55, marginBottom: '20px' }}>
            Single-screen daily logging: diners served counter, digital leftover scales per recipe, and expected cooking portion forecasts.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', marginTop: 'auto' }}>
            <span>Enter Kitchen View</span> <ArrowRight size={16} />
          </div>
        </SpatialCard>

        {/* Warden Gateway */}
        <SpatialCard
          onClick={() => onSelectTab('warden')}
          className="p-6 h-full"
          float="none"
          style={{ cursor: 'pointer' }}
        >
          <div style={{ fontSize: '2.4rem', marginBottom: '14px' }}>🛡️</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Warden Oversight</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', lineHeight: 1.55, marginBottom: '20px' }}>
            Weekly waste analytics, 5-rating privacy gate threshold, and the public "You said, we did" Action Tracker closing the loop.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', marginTop: 'auto' }}>
            <span>Enter Warden View</span> <ArrowRight size={16} />
          </div>
        </SpatialCard>

        {/* Settings Gateway */}
        <SpatialCard
          onClick={() => onSelectTab('settings')}
          className="p-6 h-full"
          float="none"
          style={{ cursor: 'pointer' }}
        >
          <div style={{ fontSize: '2.4rem', marginBottom: '14px' }}>⚙️</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Configuration</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', lineHeight: 1.55, marginBottom: '20px' }}>
            Edit university name, kitchen name ({kitchenName}), student/staff personas, and customize all recipes in the Weekly Menu Editor.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', marginTop: 'auto' }}>
            <span>Open Settings</span> <ArrowRight size={16} />
          </div>
        </SpatialCard>
      </section>
    </div>
  );
};
