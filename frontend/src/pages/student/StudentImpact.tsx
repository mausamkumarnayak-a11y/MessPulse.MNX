import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { HeartHandshake, Leaf, Award, TrendingDown, Sparkles } from 'lucide-react';

export const StudentImpact: React.FC = () => {
  const [impact, setImpact] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const data = await api.getStudentImpact();
        setImpact(data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchImpact();
  }, []);

  return (
    <div className="app-container">
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--olive-600)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
          <HeartHandshake size={14} />
          <span>Sustainability Record</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--olive-900)' }}>My Food Waste Impact</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Real numbers showing how advance notifications prevent campus kitchen overcooking.
        </p>
      </div>

      {loading ? (
        <div className="neumo-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          Calculating your personal impact...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Main Stat Card */}
          <div className="neumo-card" style={{ padding: 24, background: 'linear-gradient(135deg, #E8EDE5 0%, #DFE7DB 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #2D4A3E 0%, #1E352B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4ADE80'
              }}>
                <Leaf size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--olive-900)' }}>
                  {impact?.student_name || 'Student'}
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Ashoka Hall Campus Steward
                </span>
              </div>
            </div>

            <div className="grid-2" style={{ gap: 14, marginBottom: 16 }}>
              <div className="neumo-inset" style={{ padding: 18, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--olive-600)', fontFamily: 'var(--font-display)' }}>
                  {impact?.meals_skipped_on_time || 0}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--olive-800)', marginTop: 2 }}>
                  Meals Skipped on Time
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Reported before kitchen cut-off
                </div>
              </div>

              <div className="neumo-inset" style={{ padding: 18, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--veg-green)', fontFamily: 'var(--font-display)' }}>
                  {impact?.estimated_food_saved_kg || 0} kg
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--olive-800)', marginTop: 2 }}>
                  Surplus Food Prevented
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  ~0.38 kg per student meal
                </div>
              </div>
            </div>

            <p style={{
              fontSize: '0.88rem',
              color: 'var(--olive-800)',
              background: 'rgba(255, 255, 255, 0.65)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              lineHeight: 1.5
            }}>
              ✨ {impact?.impact_summary || 'Your early meal skips directly reduce food cooked and keep mess subscription costs down.'}
            </p>
          </div>

          {/* Badges / Equivalents */}
          <div className="neumo-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--olive-900)', marginBottom: 14 }}>
              Campus Equivalents
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: '#FFFFFF', borderRadius: 10 }}>
                <Award size={20} color="var(--olive-600)" />
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <strong>Equivalent to {Math.round((impact?.estimated_food_saved_kg || 1) * 3)} fresh rotis saved</strong> from being thrown away.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: '#FFFFFF', borderRadius: 10 }}>
                <TrendingDown size={20} color="var(--veg-green)" />
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <strong>Reduced LPG kitchen fuel usage</strong> proportional to batch cooking adjustments.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
