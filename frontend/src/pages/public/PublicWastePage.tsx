import React, { useState, useEffect } from 'react';
import { PublicWasteMeter } from '../../types';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { 
  Gauge, TrendingDown, Users, CalendarX2, 
  Sparkles, HeartHandshake, ArrowRight, ShieldCheck 
} from 'lucide-react';

export const PublicWastePage: React.FC = () => {
  const [data, setData] = useState<PublicWasteMeter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeter = async () => {
      try {
        setLoading(true);
        const res = await api.getPublicWasteMeter();
        setData(res);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchMeter();
  }, []);

  return (
    <div className="app-container">
      {/* Hero Banner */}
      <div style={{ textAlign: 'center', marginBottom: 26, padding: '10px 0' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--amber-100)',
          color: 'var(--amber-600)',
          fontWeight: 700,
          fontSize: '0.8rem',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          textTransform: 'uppercase',
          marginBottom: 10
        }}>
          <Gauge size={14} />
          <span>Live Campus Food Waste Meter</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: 'var(--olive-900)', marginBottom: 6 }}>
          {data?.mess_name || 'Hostel Campus Mess'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: 600, margin: '0 auto' }}>
          Real measurements from kitchen service trays showing the collective impact of student ratings and timely skips.
        </p>
      </div>

      {loading ? (
        <div className="neumo-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
          Reading campus kitchen meters...
        </div>
      ) : !data ? (
        <div className="neumo-card" style={{ padding: 32, textAlign: 'center' }}>
          Meter currently undergoing routine calibration.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top 3 Impact Cards */}
          <div className="grid-3">
            <div className="neumo-card" style={{ padding: 22, textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Leftover Food This Week
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--olive-900)', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
                {data.total_waste_this_week_kg} kg
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Average <strong>{data.waste_per_student_per_meal_kg} kg</strong> per diner
              </div>
            </div>

            <div className="neumo-card" style={{ padding: 22, textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Waste Reduction Trend
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--veg-green)', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
                -{data.weekly_waste_reduced_pct}%
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--veg-green)', fontWeight: 600 }}>
                Compared to pilot baseline
              </div>
            </div>

            <div className="neumo-card" style={{ padding: 22, textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Meals Skipped on Time
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--amber-500)', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
                {data.meals_skipped_on_time}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Portions adjusted before cooking
              </div>
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          <div className="neumo-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--olive-900)', marginBottom: 16 }}>
              Past 7 Days Kitchen Leftover Record
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: 180,
              padding: '10px 0 0 0',
              borderBottom: '2px solid rgba(45, 74, 62, 0.15)'
            }}>
              {data.daily_history.map((day) => {
                const maxVal = Math.max(...data.daily_history.map((d) => d.waste_kg), 12);
                const pct = Math.min(100, Math.max(12, (day.waste_kg / maxVal) * 100));

                return (
                  <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 6 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--olive-900)' }}>
                      {day.waste_kg} kg
                    </span>
                    <div
                      style={{
                        width: '50%',
                        maxWidth: 40,
                        height: `${pct}%`,
                        background: 'linear-gradient(180deg, #527E6B 0%, #2D4A3E 100%)',
                        borderRadius: '6px 6px 0 0',
                        boxShadow: '0 2px 6px rgba(45, 74, 62, 0.25)',
                        transition: 'height 0.3s ease'
                      }}
                      title={`${day.date}: ${day.waste_kg} kg leftover`}
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent You Said We Did Actions */}
          <div className="neumo-card" style={{ padding: 24 }}>
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HeartHandshake size={20} color="var(--olive-700)" />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--olive-900)' }}>
                  Recent Kitchen Changes ("You Said, We Did")
                </h3>
              </div>
              <Link to="/actions" style={{ fontSize: '0.85rem', color: 'var(--amber-600)', fontWeight: 700, textDecoration: 'none' }}>
                View All →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.recent_actions.map((act) => (
                <div key={act.id} className="neumo-inset" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#E8F5E9', color: 'var(--veg-green)', padding: '2px 8px', borderRadius: 12 }}>
                      ✓ Resolved
                    </span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--olive-900)' }}>{act.title}</strong>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                    {act.description}
                  </p>
                  {act.outcome && (
                    <div style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>
                      ✨ {act.outcome}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Call to action for students */}
          <div style={{
            background: 'linear-gradient(135deg, #2D4A3E 0%, #1A2F26 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            color: '#FFFFFF',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(20, 36, 29, 0.25)'
          }}>
            <h3 style={{ fontSize: '1.4rem', color: '#F5AB4D', marginBottom: 8 }}>
              Eat at Ashoka Mess Today?
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#E4ECE7', maxWidth: 480, margin: '0 auto 16px auto' }}>
              Your feedback is 100% anonymous and directly improves recipes and portion planning.
            </p>
            <Link
              to="/student"
              className="skeuo-btn skeuo-btn-amber"
              style={{ display: 'inline-flex', padding: '12px 28px', fontSize: '1rem', textDecoration: 'none' }}
            >
              <Sparkles size={18} />
              <span>Rate Today's Meal (5 sec)</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
