import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { 
  UtensilsCrossed, Sparkles, Scale, Gauge, 
  HeartHandshake, Compass, ArrowRight, ShieldCheck, 
  Leaf, CheckCircle2, Star, Clock 
} from 'lucide-react';

interface LandingPageProps {
  onStartTour: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartTour }) => {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleLaunch = async (role: UserRole) => {
    await switchRole(role);
    if (role === 'student') navigate('/student');
    else if (role === 'staff') navigate('/staff');
    else if (role === 'warden' || role === 'admin') navigate('/warden');
  };

  return (
    <div className="app-container">
      {/* Hero Header */}
      <div style={{ textAlign: 'center', padding: '24px 0 32px 0' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--amber-100)',
          color: 'var(--amber-600)',
          fontWeight: 800,
          fontSize: '0.8rem',
          padding: '5px 14px',
          borderRadius: 'var(--radius-full)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: 14
        }}>
          <Leaf size={14} />
          <span>Hacktoberfest 2026 Innovation</span>
        </div>

        <h1 style={{
          fontSize: '2.4rem',
          lineHeight: 1.15,
          color: 'var(--olive-900)',
          maxWidth: 720,
          margin: '0 auto 12px auto'
        }}>
          Turn Hostel Mess Feedback Into <span style={{ color: 'var(--amber-500)' }}>Less Food Waste</span> & Better Meals.
        </h1>

        <p style={{
          fontSize: '1.05rem',
          color: 'var(--text-secondary)',
          maxWidth: 620,
          margin: '0 auto 24px auto',
          lineHeight: 1.5
        }}>
          MessPulse connects students, cooks, and wardens in one installable PWA. 5-second anonymous ratings, advance meal skips, and weighed leftovers.
        </p>

        {/* Primary CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link
            to={user?.role === 'staff' ? '/staff' : user?.role === 'warden' ? '/warden' : '/student'}
            className="skeuo-btn skeuo-btn-amber"
            style={{ padding: '12px 24px', fontSize: '1rem', textDecoration: 'none' }}
          >
            <Sparkles size={18} />
            <span>Open Today's Menu</span>
          </Link>

          <button
            onClick={onStartTour}
            className="skeuo-btn skeuo-btn-secondary"
            style={{ padding: '12px 22px', fontSize: '0.98rem' }}
          >
            <Compass size={18} color="var(--olive-700)" />
            <span>Take Quick Tour (1 min)</span>
          </button>
        </div>
      </div>

      {/* The 5-Step Closed Feedback Loop */}
      <div className="neumo-card" style={{ padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--olive-900)', textAlign: 'center', marginBottom: 18 }}>
          The MessPulse Closed Feedback Loop
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12
        }}>
          {[
            { step: '1. Rate', title: '5-Sec Rating', desc: 'Students rate via table QR or app', icon: Star, color: 'var(--amber-500)' },
            { step: '2. Weigh', title: 'Leftover kg', desc: 'Cooks weigh dish leftovers', icon: Scale, color: 'var(--olive-700)' },
            { step: '3. Analyse', title: 'Dashboards', desc: 'Ranks wasted & disliked items', icon: Gauge, color: 'var(--olive-600)' },
            { step: '4. Act', title: 'Action Logged', desc: 'Warden logs recipe/portion fix', icon: ShieldCheck, color: 'var(--veg-green)' },
            { step: '5. Show', title: 'You Said, We Did', desc: 'Public accountability board', icon: HeartHandshake, color: '#0284C7' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="neumo-inset" style={{ padding: 14, textAlign: 'center' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px auto',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                  <Icon size={18} color={item.color} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--amber-600)', textTransform: 'uppercase' }}>
                  {item.step}
                </div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--olive-900)', display: 'block', margin: '2px 0' }}>
                  {item.title}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Personas Interactive Evaluation Cards */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--olive-900)', marginBottom: 14, textAlign: 'center' }}>
          Evaluate Any Role in 1 Click
        </h2>
        <div className="grid-3">
          {/* Student Persona */}
          <div className="neumo-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>🎓</span>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--olive-900)' }}>Hostel Student</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                Today's live menu, 5-second rating with reason tags, skip-a-meal with clear cutoffs, personal impact, and 100% anonymous privacy.
              </p>
            </div>
            <button
              onClick={() => handleRoleLaunch('student')}
              className="skeuo-btn skeuo-btn-secondary"
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              <span>Explore Student View</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Staff Persona */}
          <div className="neumo-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>🍳</span>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--olive-900)' }}>Mess Kitchen Staff</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                One-screen daily entry for diners served and weighed leftover kg per dish, expected headcount cooking calculator, and weekly menu editor.
              </p>
            </div>
            <button
              onClick={() => handleRoleLaunch('staff')}
              className="skeuo-btn skeuo-btn-secondary"
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              <span>Explore Staff View</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Warden Persona */}
          <div className="neumo-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: '1.4rem' }}>🛡️</span>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--olive-900)' }}>Warden / Admin</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
                Waste-per-head analytics, top wasted dishes rank, ratings dashboard with strict 5-rating privacy gate, and "You said, we did" action publishing.
              </p>
            </div>
            <button
              onClick={() => handleRoleLaunch('warden')}
              className="skeuo-btn skeuo-btn-amber"
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              <span>Explore Warden View</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
