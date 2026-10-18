import React, { useState, useEffect } from 'react';
import { MealSlot } from '../../types';
import { api } from '../../services/api';
import { RatingModal } from '../../components/RatingModal';
import { 
  Calendar, Clock, Star, Utensils, AlertCircle, 
  CheckCircle2, XCircle, RotateCcw, Lock, Sparkles 
} from 'lucide-react';

export const StudentToday: React.FC = () => {
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlotForRating, setSelectedSlotForRating] = useState<MealSlot | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTodaySlots();
      setSlots(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch today\'s menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleSkipToggle = async (slot: MealSlot) => {
    try {
      if (slot.is_skipped) {
        await api.undoSkip(slot.id);
        setActionSuccessMsg(`Undid skip for ${slot.meal_type}`);
      } else {
        await api.markSkip(slot.id);
        setActionSuccessMsg(`Successfully skipped ${slot.meal_type}. Kitchen headcount adjusted!`);
      }
      setTimeout(() => setActionSuccessMsg(null), 3000);
      loadSlots();
    } catch (err: any) {
      alert(err.message || 'Unable to update skip status');
    }
  };

  const handleRatingSuccess = (score: number) => {
    setSelectedSlotForRating(null);
    setActionSuccessMsg(`Thank you! Your ${score}-star rating was recorded anonymously.`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
    loadSlots();
  };

  return (
    <div className="app-container">
      {/* Page Header */}
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--olive-600)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
            <Calendar size={14} />
            <span>Today's Services</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--olive-900)' }}>Hostel Mess Menu</h1>
        </div>

        <button
          onClick={loadSlots}
          className="skeuo-btn skeuo-btn-secondary"
          style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          title="Refresh Menu"
        >
          <RotateCcw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div style={{
          background: '#E8F5E9',
          color: 'var(--veg-green)',
          border: '1px solid #A5D6A7',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.88rem',
          fontWeight: 600,
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle2 size={16} />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="neumo-card" style={{ padding: 24, height: 160, opacity: 0.6 }}>
              <div style={{ height: 20, width: '40%', background: '#D6DDD2', borderRadius: 6, marginBottom: 12 }} />
              <div style={{ height: 14, width: '70%', background: '#E2E8DE', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 14, width: '50%', background: '#E2E8DE', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="neumo-card" style={{ padding: 24, textAlign: 'center' }}>
          <AlertCircle size={36} color="var(--danger)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ color: 'var(--danger)', marginBottom: 6 }}>Could not load menu</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>{error}</p>
          <button onClick={loadSlots} className="skeuo-btn spatial-btn-primary">Try Again</button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && slots.length === 0 && (
        <div className="neumo-card" style={{ padding: 32, textAlign: 'center' }}>
          <Utensils size={40} color="var(--olive-400)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ marginBottom: 6 }}>No meal slots scheduled for today</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Check back shortly or visit the Help section for questions.
          </p>
        </div>
      )}

      {/* Meal Slots List */}
      {!loading && !error && slots.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {slots.map((slot) => (
            <div key={slot.id} className="neumo-card" style={{ padding: 20 }}>
              {/* Slot Header */}
              <div className="flex-between" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ fontSize: '1.25rem', textTransform: 'capitalize', color: 'var(--olive-900)' }}>
                      {slot.meal_type}
                    </h2>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600
                    }}>
                      <Clock size={13} />
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>
                </div>

                {/* Cutoff / Status Pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {slot.is_skipped ? (
                    <span style={{
                      background: '#FEE2E2',
                      color: '#B91C1C',
                      border: '1px solid #FECACA',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      Meal Skipped
                    </span>
                  ) : slot.can_skip ? (
                    <span style={{
                      background: 'var(--olive-100)',
                      color: 'var(--olive-800)',
                      border: '1px solid var(--olive-200)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-pill)'
                    }}>
                      Skip Cutoff: {slot.cutoff_time_str}
                    </span>
                  ) : (
                    <span style={{
                      background: '#E2E8DE',
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Lock size={12} />
                      Cutoff Passed
                    </span>
                  )}
                </div>
              </div>

              {/* Dishes list */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.45)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                marginBottom: 16,
                border: '1px solid rgba(255, 255, 255, 0.8)'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--olive-700)', marginBottom: 6 }}>
                  Served Dishes:
                </div>
                {slot.dishes.length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Menu will be updated shortly</span>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {slot.dishes.map((d) => (
                      <span
                        key={d.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: 8,
                          background: '#FFFFFF',
                          border: '1px solid rgba(45, 74, 62, 0.1)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        <span className={d.veg_flag ? 'badge-veg' : 'badge-nonveg'}>
                          {d.veg_flag ? 'Veg' : 'Non-Veg'}
                        </span>
                        <span>{d.name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons: 5-Second Rate & Skip-a-Meal */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {/* Rating Button */}
                {slot.is_rated ? (
                  <button
                    onClick={() => setSelectedSlotForRating(slot)}
                    className="skeuo-btn skeuo-btn-secondary"
                    style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem' }}
                  >
                    <Star size={15} color="var(--olive-600)" fill="var(--olive-600)" />
                    <span>Rated {slot.user_rating}/5 (Update)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedSlotForRating(slot)}
                    className="skeuo-btn spatial-btn-primary"
                    style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem' }}
                  >
                    <Sparkles size={15} />
                    <span>Rate Meal (5 sec)</span>
                  </button>
                )}

                {/* Skip / Undo Skip Button */}
                {slot.is_skipped ? (
                  <button
                    onClick={() => handleSkipToggle(slot)}
                    disabled={!slot.can_skip}
                    className="skeuo-btn skeuo-btn-secondary"
                    style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem' }}
                  >
                    <RotateCcw size={15} />
                    <span>Undo Skip</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSkipToggle(slot)}
                    disabled={!slot.can_skip}
                    className="skeuo-btn"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      fontSize: '0.85rem',
                      background: slot.can_skip 
                        ? 'linear-gradient(180deg, #3E6353 0%, #254034 100%)' 
                        : '#CBD5E1',
                      borderColor: slot.can_skip ? '#1A2F26' : '#94A3B8',
                      cursor: slot.can_skip ? 'pointer' : 'not-allowed'
                    }}
                    title={slot.can_skip ? 'Skip this meal' : 'Cutoff passed for skipping'}
                  >
                    <XCircle size={15} />
                    <span>{slot.can_skip ? 'Skip Meal' : 'Locked (Cutoff Passed)'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5-Second Rating Modal */}
      {selectedSlotForRating && (
        <RatingModal
          slot={selectedSlotForRating}
          onClose={() => setSelectedSlotForRating(null)}
          onSuccess={handleRatingSuccess}
        />
      )}
    </div>
  );
};
