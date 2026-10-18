import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarDays, CalendarX2, Gauge, HeartHandshake, 
  ClipboardEdit, Calculator, Utensils, BarChart3, 
  StarHalf, ShieldCheck, Home, HelpCircle 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();

  const getLinks = () => {
    if (!user) {
      return [
        { to: '/', label: 'Home', icon: Home },
        { to: '/public-waste', label: 'Waste Meter', icon: Gauge },
        { to: '/actions', label: 'You Said, We Did', icon: HeartHandshake },
        { to: '/help', label: 'Help', icon: HelpCircle },
      ];
    }

    if (user.role === 'student') {
      return [
        { to: '/student', label: 'Today', icon: CalendarDays },
        { to: '/student/skip', label: 'Skip Meal', icon: CalendarX2 },
        { to: '/public-waste', label: 'Waste', icon: Gauge },
        { to: '/student/impact', label: 'My Impact', icon: HeartHandshake },
        { to: '/actions', label: 'Actions', icon: ShieldCheck },
      ];
    }

    if (user.role === 'staff') {
      return [
        { to: '/staff', label: 'Daily Entry', icon: ClipboardEdit },
        { to: '/staff/expected', label: 'Headcount', icon: Calculator },
        { to: '/staff/menu', label: 'Menu Editor', icon: Utensils },
        { to: '/actions', label: 'Actions', icon: ShieldCheck },
        { to: '/help', label: 'Help', icon: HelpCircle },
      ];
    }

    // Warden / Admin
    return [
      { to: '/warden', label: 'Overview', icon: BarChart3 },
      { to: '/warden/waste', label: 'Waste Trends', icon: Gauge },
      { to: '/warden/ratings', label: 'Ratings Gate', icon: StarHalf },
      { to: '/actions', label: 'Actions', icon: HeartHandshake },
      { to: '/help', label: 'Help', icon: HelpCircle },
    ];
  };

  const links = getLinks();

  return (
    <nav className="glass-bottom-nav">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%'
      }}>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/student' || item.to === '/staff' || item.to === '/warden'}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                textDecoration: 'none',
                padding: '6px 10px',
                borderRadius: 14,
                color: isActive ? 'var(--olive-800)' : 'var(--text-muted)',
                background: isActive ? 'rgba(45, 74, 62, 0.12)' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.72rem',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={18} strokeWidth={2.2} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
