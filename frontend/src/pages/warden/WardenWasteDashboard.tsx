import React, { useState, useEffect } from 'react';
import { WasteInsights } from '../../types';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Gauge, TrendingDown, Scale, Users, Calendar, 
  AlertTriangle, ArrowUpRight, ShieldCheck 
} from 'lucide-react';

export const WardenWasteDashboard: React.FC = () => {
  const [insights, setInsights] = useState<WasteInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWaste = async () => {
      try {
        setLoading(true);
        const data = await api.getWasteInsights();
        setInsights(data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchWaste();
  }, []);

  return (
    <div className="app-container">
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--olive-600)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
          <Gauge size={14} />
          <span>Kitchen Analytics</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--olive-900)' }}>Food Waste Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Evidence-backed metrics based on measured leftover weights and recorded headcount.
        </p>
      </div>

      {loading ? (
        <div className="neumo-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          Computing waste metrics from database records...
        </div>
      ) : !insights ? (
        <div className="neumo-card" style={{ padding: 24, textAlign: 'center' }}>
          No waste entries recorded yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top KPI Cards */}
          <div className="grid-3">
            <div className="neumo-card" style={{ padding: 20, textAlign: 'center' }}>
              <Scale size={22} color="var(--olive-600)" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--olive-900)', fontFamily: 'var(--font-display)' }}>
                {insights.total_waste_kg} kg
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--olive-800)' }}>
                Total Leftover Waste
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Past {insights.days_analyzed} days
              </div>
            </div>

            <div className="neumo-card" style={{ padding: 20, textAlign: 'center' }}>
              <Users size={22} color="var(--olive-700)" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--olive-900)', fontFamily: 'var(--font-display)' }}>
                {insights.total_headcount_served.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--olive-800)' }}>
                Total Headcount Served
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Verified dining attendance
              </div>
            </div>

            <div className="neumo-card" style={{ padding: 20, textAlign: 'center' }}>
              <TrendingDown size={22} color="var(--veg-green)" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--veg-green)', fontFamily: 'var(--font-display)' }}>
                {insights.waste_per_head_kg} kg
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--olive-800)' }}>
                Waste Per Head
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Normalized per student meal
              </div>
            </div>
          </div>

          {/* 7-Day Trend Visual Chart */}
          <div className="neumo-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--olive-900)', marginBottom: 16 }}>
              7-Day Food Waste & Attendance Trend
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: 180,
              padding: '10px 0 0 0',
              borderBottom: '2px solid rgba(45, 74, 62, 0.15)'
            }}>
              {insights.daily_trend.map((day) => {
                const maxWaste = Math.max(...insights.daily_trend.map((d) => d.waste_kg), 15);
                const heightPct = Math.min(100, Math.max(10, (day.waste_kg / maxWaste) * 100));

                return (
                  <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 6 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--olive-800)' }}>
                      {day.waste_kg} kg
                    </span>
                    <div
                      style={{
                        width: '50%',
                        maxWidth: 42,
                        height: `${heightPct}%`,
                        background: 'linear-gradient(180deg, #68A780 0%, #3D6C4F 100%)',
                        borderRadius: '6px 6px 0 0',
                        boxShadow: '0 4px 12px rgba(61, 108, 79, 0.35)',
                        transition: 'height 0.3s ease'
                      }}
                      title={`${day.date}: ${day.waste_kg} kg waste, ${day.headcount} diners`}
                    />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {day.weekday}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Wasted Dishes Table */}
          <div className="neumo-card" style={{ padding: 22 }}>
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--olive-900)' }}>
                  Top Wasted Dishes Ranked
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Dishes contributing the highest cumulative leftover weight in service trays.
                </p>
              </div>
              <button
                onClick={() => navigate('/actions')}
                className="skeuo-btn spatial-btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Log Corrective Action
              </button>
            </div>

            {insights.top_wasted_dishes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No dish waste records accumulated yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {insights.top_wasted_dishes.map((item, idx) => (
                  <div
                    key={item.dish_id}
                    className="neumo-inset"
                    style={{
                      padding: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: idx === 0 ? 'var(--danger)' : 'var(--olive-700)',
                        color: '#FFFFFF',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {idx + 1}
                      </span>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--olive-900)' }}>{item.dish_name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Appeared in {item.service_count} meal services
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)', fontFamily: 'var(--font-display)' }}>
                        {item.total_waste_kg} kg
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Avg ~{item.avg_leftover_per_slot_kg} kg/service
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
