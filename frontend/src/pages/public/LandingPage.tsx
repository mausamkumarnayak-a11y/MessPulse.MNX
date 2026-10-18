import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { 
  Sparkles, Scale, Gauge, HeartHandshake, 
  Compass, ArrowRight, ShieldCheck, Star 
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
      {/* Floating Hero Section */}
      <div style={{ textAlign: 'center', padding: '36px 0 44px 0', position: 'relative' }}>
        <h1 style={{
          fontSize: '2.6rem',
          lineHeight: 1.15,
          color: 'var(--olive-950)',
          maxWidth: 760,
          margin: '0 auto 16px auto',
          letterSpacing: '-0.03em'
        }}>
          Turn Hostel Mess Feedback Into <span style={{ color: 'var(--olive-600)', textShadow: '0 0 20px rgba(79, 137, 101, 0.25)' }}>Less Food Waste</span> & Better Meals.
        </h1>

        <p style={{
          fontSize: '1.08rem',
          color: 'var(--text-secondary)',
          maxWidth: 620,
          margin: '0 auto 28px auto',
          lineHeight: 1.6
        }}>
          MessPulse connects students, kitchen staff, and wardens in one floating spatial web app. 5-second anonymous ratings, advance meal skips, and weighed leftovers.
        </p>

        {/* Primary CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link
            to={user?.role === 'staff' ? '/staff' : user?.role === 'warden' ? '/warden' : '/student'}
            className="skeuo-btn"
            style={{ padding: '13px 28px', fontSize: '1rem', textDecoration: 'none' }}
          >
            <Sparkles size={18} />
            <span>Open Today's Menu</span>
          </Link>

          <button
            onClick={onStartTour}
            className="skeuo-btn skeuo-btn-secondary"
            style={{ padding: '13px 24px', fontSize: '0.98rem' }}
          >
            <Compass size={18} color="var(--olive-700)" />
            <span>Take Quick Tour (1 min)</span>
          </button>
        </div>
      </div>

      {/* The 5-Step Closed Feedback Loop in Spatial Glass */}
      <div className="neumo-card" style={{ padding: 28, marginBottom: 32 }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--olive-900)', textAlign: 'center', marginBottom: 20 }}>
          The MessPulse Closed Feedback Loop
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 14
        }}>
          {[
            { step: '1. Rate', title: '5-Sec Rating', desc: 'Students rate via table QR or app', icon: Star, color: 'var(--olive-600)' },
            { step: '2. Weigh', title: 'Leftover kg', desc: 'Cooks weigh dish leftovers', icon: Scale, color: 'var(--olive-700)' },
            { step: '3. Analyse', title: 'Dashboards', desc: 'Ranks wasted & disliked items', icon: Gauge, color: 'var(--olive-600)' },
            { step: '4. Act', title: 'Action Logged', desc: 'Warden logs recipe/portion fix', icon: ShieldCheck, color: 'var(--veg-green)' },
            { step: '5. Show', title: 'You Said, We Did', desc: 'Public accountability board', icon: HeartHandshake, color: 'var(--olive-700)' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="neumo-inset" style={{ padding: 16, textAlign: 'center' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto',
                  boxShadow: '0 4px 10px rgba(19, 35, 25, 0.08)'
                }}>
                  <Icon size={20} color={item.color} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--olive-600)', textTransform: 'uppercase' }}>
                  {item.step}
                </div>
                <strong style={{ fontSize: '0.92rem', color: 'var(--olive-900)', display: 'block', margin: '3px 0' }}>
                  {item.title}
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {item.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Personas Interactive Evaluation Cards */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--olive-900)', marginBottom: 16, textAlign: 'center' }}>
          Evaluate Any Role in 1 Click
        </h2>
        <div className="grid-3">
          {/* Student Persona */}
          <div className="neumo-card neumo-card-interactive" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>🎓</span>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--olive-900)' }}>Hostel Student</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 16 }}>
                Today's live menu, 5-second rating with reason tags, skip-a-meal with clear cutoffs, personal impact, and 100% anonymous privacy.
              </p>
            </div>
            <button
              onClick={() => handleRoleLaunch('student')}
              className="skeuo-btn skeuo-btn-secondary"
              style={{ width: '100%', fontSize: '0.88rem' }}
            >
              <span>Explore Student View</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Staff Persona */}
          <div className="neumo-card neumo-card-interactive" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>🍳</span>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--olive-900)' }}>Mess Kitchen Staff</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 16 }}>
                One-screen daily entry for diners served and weighed leftover kg per dish, expected headcount cooking calculator, and weekly menu editor.
              </p>
            </div>
            <button
              onClick={() => handleRoleLaunch('staff')}
              className="skeuo-btn skeuo-btn-secondary"
              style={{ width: '100%', fontSize: '0.88rem' }}
            >
              <span>Explore Staff View</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Warden Persona */}
          <div className="neumo-card neumo-card-interactive" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--olive-900)' }}>Warden / Admin</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 16 }}>
                Waste-per-head analytics, top wasted dishes rank, ratings dashboard with strict 5-rating privacy gate, and "You said, we did" action publishing.
              </p>
            </div>
            <button
              onClick={() => handleRoleLaunch('warden')}
              className="skeuo-btn"
              style={{ width: '100%', fontSize: '0.88rem' }}
            >
              <span>Explore Warden View</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
