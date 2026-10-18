import React, { useState, useEffect } from 'react';
import { MealSlot, ExpectedHeadcount } from '../../types';
import { api } from '../../services/api';
import { Calculator, Users, MinusCircle, Percent, ArrowRight, ShieldAlert, Info } from 'lucide-react';

export const StaffExpectedHeadcount: React.FC = () => {
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [forecast, setForecast] = useState<ExpectedHeadcount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true);
        const data = await api.getTodaySlots();
        setSlots(data);
        if (data.length > 0) {
          setSelectedSlotId(data[0].id);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  useEffect(() => {
    if (!selectedSlotId) return;
    const fetchForecast = async () => {
      try {
        const data = await api.getExpectedHeadcount(selectedSlotId);
        setForecast(data);
      } catch {
        setForecast(null);
      }
    };
    fetchForecast();
  }, [selectedSlotId]);

  return (
    <div className="app-container">
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--olive-600)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
          <Calculator size={14} />
          <span>Kitchen Planning</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--olive-900)' }}>Expected Headcount Guide</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Transparent cooking forecasts derived from registered residents, recorded skips, and weekday show-up rates.
        </p>
      </div>

      {/* Select Slot */}
      <div className="neumo-card" style={{ padding: 18, marginBottom: 20 }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--olive-900)', display: 'block', marginBottom: 10 }}>
          Select Meal Slot to Forecast:
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {slots.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSlotId(s.id)}
              className={`skeuo-btn ${selectedSlotId === s.id ? 'spatial-btn-primary' : 'skeuo-btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              <span style={{ textTransform: 'capitalize' }}>{s.meal_type}</span>
            </button>
          ))}
        </div>
      </div>

      {forecast && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Main Calculation Card */}
          <div className="neumo-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--olive-900)', marginBottom: 16 }}>
              Formula & Calculation Breakdown
            </h3>

            <div className="grid-3" style={{ gap: 12, marginBottom: 20 }}>
              <div className="neumo-inset" style={{ padding: 16, textAlign: 'center' }}>
                <Users size={20} color="var(--olive-700)" style={{ margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--olive-900)', fontFamily: 'var(--font-display)' }}>
                  {forecast.registered_students}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Hostel Capacity
                </div>
              </div>

              <div className="neumo-inset" style={{ padding: 16, textAlign: 'center' }}>
                <MinusCircle size={20} color="var(--danger)" style={{ margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger)', fontFamily: 'var(--font-display)' }}>
                  {forecast.skips_recorded}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  On-Time Skips
                </div>
              </div>

              <div className="neumo-inset" style={{ padding: 16, textAlign: 'center' }}>
                <Percent size={20} color="var(--olive-600)" style={{ margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--olive-700)', fontFamily: 'var(--font-display)' }}>
                  {Math.round(forecast.historical_showup_rate * 100)}%
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Historical Show-Up
                </div>
              </div>
            </div>

            {/* Target Recommendation Box */}
            <div style={{
              background: 'linear-gradient(135deg, #24412F 0%, #132319 100%)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(20, 36, 29, 0.25)',
              marginBottom: 16
            }}>
              <div style={{ fontSize: '0.85rem', color: '#A7F3D0', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                Recommended Cooking Quantity Target
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#34D399', margin: '6px 0', textShadow: '0 0 20px rgba(52, 211, 153, 0.4)' }}>
                {forecast.expected_headcount} portions
              </div>
              <div style={{ fontSize: '0.92rem', color: '#E4ECE7' }}>
                Suggested safety prep range: <strong>{forecast.expected_range_low} – {forecast.expected_range_high} diners</strong>
              </div>
            </div>

            {/* Confidence & Source Info */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#FFFFFF', padding: 12, borderRadius: 10 }}>
              <Info size={18} color="var(--olive-600)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <strong>No Black-Box AI:</strong> {forecast.confidence_note}. All statistics link directly to previous headcount and skip logs.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
