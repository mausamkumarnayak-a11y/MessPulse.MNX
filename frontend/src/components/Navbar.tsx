import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  UtensilsCrossed, HelpCircle, Compass, LogOut, 
  LogIn, UserCheck, Shield, ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onStartTour: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onStartTour }) => {
  const { user, logout, switchRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleRoleSelect = async (role: UserRole) => {
    setRoleMenuOpen(false);
    await switchRole(role);
    if (role === 'student') navigate('/student');
    else if (role === 'staff') navigate('/staff');
    else if (role === 'warden' || role === 'admin') navigate('/warden');
  };

  return (
    <header className="glass-header">
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        {/* Brand Logo & Name */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #2D4A3E 0%, #1B3329 100%)',
            border: '1px solid #3E6353',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 6px rgba(20, 36, 29, 0.2)'
          }}>
            <UtensilsCrossed size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--olive-900)',
                letterSpacing: '-0.02em'
              }}>MessPulse</span>
              <span style={{
                background: 'linear-gradient(180deg, #4F8965 0%, #2E533C 100%)',
                color: '#FFFFFF',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                boxShadow: '0 2px 6px rgba(46, 83, 60, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.4)'
              }}>Pilot</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Ashoka Hall Mess
            </div>
          </div>
        </Link>

        {/* Center / Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Quick Interactive Tour Trigger */}
          <button
            onClick={onStartTour}
            id="nav-tour-btn"
            className="skeuo-btn skeuo-btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            title="Start Interactive Tour"
          >
            <Compass size={15} color="var(--olive-700)" />
            <span style={{ display: 'inline' }}>Tour</span>
          </button>

          {/* Help Center */}
          <Link
            to="/help"
            id="nav-help-btn"
            className="skeuo-btn skeuo-btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.82rem', textDecoration: 'none' }}
            title="Help Centre & Guide"
          >
            <HelpCircle size={15} color="var(--olive-700)" />
            <span style={{ display: 'inline' }}>Help</span>
          </Link>

          {/* Role Switcher Pill (Great for Review & Evaluation) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              id="nav-role-switcher"
              className="skeuo-btn"
              style={{
                padding: '7px 16px',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(180deg, #3D6C4F 0%, #24412F 100%)',
                borderColor: '#132319'
              }}
            >
              <UserCheck size={14} color="#FFF" />
              <span>{user ? `${user.role.toUpperCase()}` : 'Switch Persona'}</span>
              <ChevronDown size={14} />
            </button>

            {roleMenuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 290 }}
                  onClick={() => setRoleMenuOpen(false)}
                />
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  width: 240,
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 16px 36px rgba(19, 35, 25, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  zIndex: 300,
                  padding: 6
                }}>
                <div style={{ padding: '6px 10px', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Select Persona to Evaluate
                </div>
                {(['student', 'staff', 'warden', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleSelect(r)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: 'none',
                      background: user?.role === r ? 'var(--olive-100)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      fontFamily: 'var(--font-body)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.85rem', textTransform: 'capitalize', color: 'var(--olive-900)' }}>
                        {r}
                      </strong>
                      {user?.role === r && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--veg-green)', fontWeight: 700 }}>Active</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {DEMO_CREDENTIALS[r].name}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          </div>

          {/* User Profile / Logout or Sign In */}
          {isAuthenticated ? (
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="skeuo-btn skeuo-btn-secondary"
              style={{ padding: '7px 12px' }}
              title="Sign Out"
            >
              <LogOut size={15} color="var(--danger)" />
            </button>
          ) : (
            <Link
              to="/login"
              className="skeuo-btn"
              style={{ padding: '7px 16px', fontSize: '0.82rem', textDecoration: 'none' }}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
