import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { MealSlot } from '../types';
import { api } from '../services/api';
import { X, Lock, CheckCircle2, Sparkles } from 'lucide-react';

interface RatingModalProps {
  slot: MealSlot;
  onClose: () => void;
  onSuccess: (score: number) => void;
}

const REASON_TAGS = [
  { id: 'taste', label: 'Great Taste' },
  { id: 'salt', label: 'Salt Level' },
  { id: 'oil', label: 'Too Oily' },
  { id: 'temperature', label: 'Food Temp' },
  { id: 'quantity', label: 'Portion Size' },
  { id: 'hygiene', label: 'Hygiene' },
];

export const RatingModal: React.FC<RatingModalProps> = ({ slot, onClose, onSuccess }) => {
  const [score, setScore] = useState<number>(slot.user_rating || 5);
  const [hoverScore, setHoverScore] = useState<number>(0);
  const [selectedDishId, setSelectedDishId] = useState<string | undefined>(
    slot.dishes.length > 0 ? slot.dishes[0].id : undefined
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock body scrolling when modal is open and add ESC key listener
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.submitRating(slot.id, {
        dish_id: selectedDishId,
        score,
        tags: selectedTags,
        comment: comment.trim() || undefined
      });

      // Trigger tactile celebration confetti
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#4F8965', '#24412F', '#34D399', '#A7F3D0', '#FFFFFF']
        });
      } catch {
        // Fallback gracefully
      }

      onSuccess(score);
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating');
      setLoading(false);
    }
  };

  const modalNode = (
    <div className="glass-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="glass-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Pinned Header */}
        <div className="glass-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--olive-600)', letterSpacing: '0.04em' }}>
                {slot.meal_type} Rating
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• 5-Second Feedback</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--olive-950)', margin: 0 }}>
              How was your meal?
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Rating Modal"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(46, 83, 60, 0.15)',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="glass-modal-body">
          {error && (
            <div style={{
              background: '#FEE2E2',
              color: '#B91C1C',
              border: '1px solid #FECACA',
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: '0.85rem',
              marginBottom: 14
            }}>
              {error}
            </div>
          )}

          {/* Dish Selector if multiple dishes */}
          {slot.dishes.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Rate Dish or Overall Meal:
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {slot.dishes.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDishId(d.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: selectedDishId === d.id ? 'var(--olive-800)' : 'rgba(46, 83, 60, 0.18)',
                      background: selectedDishId === d.id 
                        ? 'linear-gradient(180deg, #3D6C4F 0%, #24412F 100%)' 
                        : '#FFFFFF',
                      color: selectedDishId === d.id ? '#FFFFFF' : 'var(--text-primary)',
                      boxShadow: selectedDishId === d.id ? '0 2px 6px rgba(19, 35, 25, 0.25)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {d.name} {d.veg_flag ? '🌱' : '🍗'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 1-5 Star Tactile Selector */}
          <div style={{
            background: 'var(--inset-bg)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            textAlign: 'center',
            boxShadow: 'var(--inset-shadow)',
            marginBottom: 16,
            border: '1px solid rgba(46, 83, 60, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverScore(star)}
                  onMouseLeave={() => setHoverScore(0)}
                  onClick={() => setScore(star)}
                  className={`rating-star-btn ${star <= (hoverScore || score) ? 'active' : ''}`}
                  style={{
                    color: star <= (hoverScore || score) ? 'var(--olive-600)' : '#BAC4B5',
                    fontSize: '1.85rem',
                    padding: '4px'
                  }}
                  aria-label={`Rate ${star} star`}
                >
                  ★
                </button>
              ))}
            </div>
            <div style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--olive-800)',
              marginTop: 4
            }}>
              {score === 5 && '🌟 Excellent — Really enjoyed it!'}
              {score === 4 && '👍 Good — Satisfying meal'}
              {score === 3 && '😐 Average — Decent, room for improvement'}
              {score === 2 && '👎 Below expectations — Needs adjustment'}
              {score === 1 && '⚠️ Poor — Unacceptable quality'}
            </div>
          </div>

          {/* Quick Reason Tag Chips */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Quick Reason Tags (Tap any):
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {REASON_TAGS.map((tag) => {
                const selected = selectedTags.includes(tag.id);
                return (
                  <div
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`reason-tag-chip ${selected ? 'selected' : ''}`}
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    {selected && <CheckCircle2 size={12} />}
                    <span>{tag.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Short Optional Comment */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              Short Note (Optional, max 150 chars):
            </label>
            <input
              type="text"
              maxLength={150}
              placeholder="e.g. Rice was hot, but Dal needed slightly less salt"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="neumo-input"
              style={{ fontSize: '0.88rem', padding: '10px 14px' }}
            />
          </div>

          {/* Privacy Note Guarantee */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(46, 83, 60, 0.08)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            color: 'var(--olive-800)',
            border: '1px solid rgba(46, 83, 60, 0.12)'
          }}>
            <Lock size={14} color="var(--olive-700)" style={{ flexShrink: 0 }} />
            <span>
              <strong>100% Anonymous:</strong> Staff & wardens never see individual student names.
            </span>
          </div>
        </div>

        {/* Pinned Always-Visible Sticky Footer */}
        <div className="glass-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="skeuo-btn skeuo-btn-secondary"
            style={{ flex: 1, padding: '10px 16px', fontSize: '0.88rem' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="skeuo-btn spatial-btn-primary"
            style={{ flex: 2, padding: '10px 16px', fontSize: '0.88rem' }}
          >
            <Sparkles size={16} />
            <span>{loading ? 'Submitting...' : 'Submit Rating'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};
