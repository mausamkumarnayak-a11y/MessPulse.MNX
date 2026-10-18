import React, { useState, useEffect } from 'react';
import { MealSlot } from '../../types';
import { api } from '../../services/api';
import { CalendarX2, Clock, CheckCircle2, AlertCircle, Info, Lock } from 'lucide-react';

export const StudentSkip: React.FC = () => {
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const data = await api.getTodaySlots();
      setSlots(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleToggle = async (slot: MealSlot) => {
    try {
      if (slot.is_skipped) {
        await api.undoSkip(slot.id);
        setFeedbackMsg(`Skip canceled for ${slot.meal_type}. Your plate is reserved.`);
      } else {
        await api.markSkip(slot.id);
        setFeedbackMsg(`Marked ${slot.meal_type} as skipped. Thank you for reducing food waste!`);
      }
      setTimeout(() => setFeedbackMsg(null), 3000);
      loadSlots();
    } catch (err: any) {
      alert(err.message || 'Cutoff has passed for this meal slot.');
    }
  };

  return (
    <div className="app-container">
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--olive-600)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
          <CalendarX2 size={14} />
          <span>Meal RSVP</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--olive-900)' }}>Skip a Meal</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Marking meals you will not eat informs the kitchen team in advance so they prepare fewer kilograms.
        </p>
      </div>

      {feedbackMsg && (
        <div style={{
          background: '#E8F5E9',
          color: 'var(--veg-green)',
          border: '1px solid #A5D6A7',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.88rem',
          fontWeight: 600,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Explanatory callout */}
      <div className="neumo-card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Info size={20} color="var(--olive-600)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>How the cut-off works:</strong> To prevent last-minute shortages, meal skips lock <strong>60 minutes</strong> before meal service begins. You may undo a skip anytime before the cut-off.
        </div>
      </div>

      {loading ? (
        <div className="neumo-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading meal services...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="neumo-card"
              style={{
                padding: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontSize: '1.15rem', textTransform: 'capitalize', color: 'var(--olive-900)' }}>
                    {slot.meal_type}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {slot.start_time} - {slot.end_time}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {slot.can_skip ? (
                    <span style={{ color: 'var(--olive-700)', fontWeight: 700 }}>
                      Cut-off time: {slot.cutoff_time_str}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={12} /> Cut-off has passed for this service
                    </span>
                  )}
                </div>
              </div>

              <div>
                {slot.is_skipped ? (
                  <button
                    onClick={() => handleToggle(slot)}
                    disabled={!slot.can_skip}
                    className="skeuo-btn skeuo-btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    Undo Skip
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggle(slot)}
                    disabled={!slot.can_skip}
                    className="skeuo-btn spatial-btn-primary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      opacity: slot.can_skip ? 1 : 0.5
                    }}
                  >
                    {slot.can_skip ? 'Skip This Meal' : 'Locked'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
