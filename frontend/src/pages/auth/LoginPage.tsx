import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { UtensilsCrossed, LogIn, Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setError(null);
    setLoading(true);
    const cred = DEMO_CREDENTIALS[role];
    try {
      await login(cred.email, 'Password123!');
      if (role === 'student') navigate('/student');
      else if (role === 'staff') navigate('/staff');
      else if (role === 'warden' || role === 'admin') navigate('/warden');
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: 460, paddingTop: 40 }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #2D4A3E 0%, #1B3329 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px auto',
          boxShadow: '0 8px 16px rgba(20, 36, 29, 0.25)'
        }}>
          <UtensilsCrossed size={28} color="#F5AB4D" />
        </div>
        <h1 style={{ fontSize: '1.85rem', color: 'var(--olive-900)' }}>Sign in to MessPulse</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
          Ashoka Hall of Residence Mess Platform
        </p>
      </div>

      <div className="neumo-card" style={{ padding: 28 }}>
        {error && (
          <div style={{
            background: '#FEE2E2',
            color: '#B91C1C',
            border: '1px solid #FECACA',
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: '0.85rem',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--olive-900)', display: 'block', marginBottom: 6 }}>
              Campus Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="e.g. student@ashoka.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neumo-input"
                style={{ paddingLeft: 38 }}
                required
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--olive-900)', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neumo-input"
                style={{ paddingLeft: 38 }}
                required
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="skeuo-btn skeuo-btn-amber"
            style={{ padding: '12px', fontSize: '0.98rem', marginTop: 4 }}
          >
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* 1-Click Evaluation / Demo Logins */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(45, 74, 62, 0.12)' }}>
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--olive-800)',
            marginBottom: 10,
            textAlign: 'center'
          }}>
            ⚡ 1-Click Persona Demo Logins
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className="skeuo-btn skeuo-btn-secondary"
              style={{ padding: '8px', fontSize: '0.78rem' }}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff')}
              className="skeuo-btn skeuo-btn-secondary"
              style={{ padding: '8px', fontSize: '0.78rem' }}
            >
              🍳 Mess Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('warden')}
              className="skeuo-btn skeuo-btn-secondary"
              style={{ padding: '8px', fontSize: '0.78rem' }}
            >
              🛡️ Warden
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="skeuo-btn skeuo-btn-secondary"
              style={{ padding: '8px', fontSize: '0.78rem' }}
            >
              ⚙️ Admin
            </button>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
            Demo password: <code>Password123!</code>
          </div>
        </div>
      </div>
    </div>
  );
};
