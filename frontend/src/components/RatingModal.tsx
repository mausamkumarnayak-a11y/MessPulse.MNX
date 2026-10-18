import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MealSlot, Dish } from '../types';
import { api } from '../services/api';
import { Star, X, Lock, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react';

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
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#E29538', '#2D4A3E', '#4ADE80']
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

  return (
    <div className="glass-modal-backdrop" onClick={onClose}>
      <div
        className="glass-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 24 }}
      >
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--amber-600)' }}>
                {slot.meal_type} Rating
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• 5-Second Feedback</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--olive-900)' }}>
              How was your meal?
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 4
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            background: '#FEE2E2',
            color: '#B91C1C',
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
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Rate Dish or Overall Meal:
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {slot.dishes.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDishId(d.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selectedDishId === d.id ? 'var(--olive-700)' : 'rgba(45, 74, 62, 0.15)',
                    background: selectedDishId === d.id ? 'var(--olive-700)' : '#FFFFFF',
                    color: selectedDishId === d.id ? '#FFFFFF' : 'var(--text-primary)',
                    boxShadow: selectedDishId === d.id ? '0 2px 4px rgba(0,0,0,0.15)' : 'none',
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
          background: 'var(--card-bg)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          textAlign: 'center',
          boxShadow: 'inset 2px 2px 5px var(--card-shadow), inset -2px -2px 5px var(--card-highlight)',
          marginBottom: 18
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverScore(star)}
                onMouseLeave={() => setHoverScore(0)}
                onClick={() => setScore(star)}
                className={`rating-star-btn ${star <= (hoverScore || score) ? 'active' : ''}`}
                style={{
                  color: star <= (hoverScore || score) ? 'var(--amber-500)' : '#BAC4B5'
                }}
              >
                ★
              </button>
            ))}
          </div>
          <div style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--olive-800)',
            marginTop: 6
          }}>
            {score === 5 && '🌟 Excellent — Really enjoyed it!'}
            {score === 4 && '👍 Good — Satisfying meal'}
            {score === 3 && '😐 Average — Decent but room for improvement'}
            {score === 2 && '👎 Below expectations — Needs adjustment'}
            {score === 1 && '⚠️ Poor — Unacceptable quality'}
          </div>
        </div>

        {/* Quick Reason Tag Chips */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Quick Reason Tags (Tap any):
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {REASON_TAGS.map((tag) => {
              const selected = selectedTags.includes(tag.id);
              return (
                <div
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`reason-tag-chip ${selected ? 'selected' : ''}`}
                >
                  {selected && <CheckCircle2 size={13} />}
                  <span>{tag.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Short Optional Comment */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
            Short Note (Optional, max 150 chars):
          </label>
          <input
            type="text"
            maxLength={150}
            placeholder="e.g. Rice was nice and hot, but Dal needed slightly less salt"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="neumo-input"
          />
        </div>

        {/* Privacy Note Guarantee */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(45, 74, 62, 0.08)',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.78rem',
          color: 'var(--olive-800)',
          marginBottom: 20
        }}>
          <Lock size={15} color="var(--olive-700)" />
          <span>
            <strong>Your rating is 100% anonymous.</strong> Mess staff and wardens never see student names or individual votes.
          </span>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={onClose}
            className="skeuo-btn skeuo-btn-secondary"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="skeuo-btn skeuo-btn-amber"
            style={{ flex: 2 }}
          >
            <Sparkles size={16} />
            <span>{loading ? 'Submitting...' : 'Submit Rating'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
