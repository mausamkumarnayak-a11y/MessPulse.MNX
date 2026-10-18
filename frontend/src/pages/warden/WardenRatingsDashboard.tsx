import React, { useState, useEffect } from 'react';
import { RatingsInsights } from '../../types';
import { api } from '../../services/api';
import { 
  Star, Lock, CheckCircle2, AlertCircle, Shield, 
  BarChart2, Info, ThumbsUp, Sparkles 
} from 'lucide-react';

export const WardenRatingsDashboard: React.FC = () => {
  const [insights, setInsights] = useState<RatingsInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        const data = await api.getRatingsInsights();
        setInsights(data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, []);

  return (
    <div className="app-container">
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--olive-600)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
          <Star size={14} />
          <span>Student Feedback</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--olive-900)' }}>Ratings & Privacy Gate</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Aggregated meal feedback protected by an automated backend privacy gate requiring at least 5 ratings.
        </p>
      </div>

      {/* Privacy Gate Education Banner */}
      <div className="neumo-card" style={{ padding: 18, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start', background: '#F8FAF7' }}>
        <Shield size={22} color="var(--olive-700)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>Zero Identity Leakage:</strong> Individual student names are never returned by any API. In addition, average dish ratings remain masked until at least <strong>5 individual students</strong> submit ratings, ensuring student committee reviews cannot identify specific opinions.
        </div>
      </div>

      {loading ? (
        <div className="neumo-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          Aggregating anonymous student ratings...
        </div>
      ) : !insights ? (
        <div className="neumo-card" style={{ padding: 24, textAlign: 'center' }}>
          No ratings found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top Summary Cards */}
          <div className="grid-2">
            <div className="neumo-card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--olive-900)', fontFamily: 'var(--font-display)' }}>
                {insights.total_ratings_count}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--olive-800)' }}>
                Total Anonymous Ratings
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {insights.status_message}
              </div>
            </div>

            <div className="neumo-card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--olive-600)', fontFamily: 'var(--font-display)' }}>
                {insights.overall_average_score ? `★ ${insights.overall_average_score}` : 'Withheld'}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--olive-800)' }}>
                Overall Mess Score
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {insights.sample_size_met ? 'Sufficient sample gate met (≥5 ratings)' : 'Sample gate active (<5 ratings)'}
              </div>
            </div>
          </div>

          {/* Reason Tags Frequency */}
          <div className="neumo-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--olive-900)', marginBottom: 14 }}>
              Student Reason Tag Frequency
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              {Object.entries(insights.tag_breakdown).map(([tag, count]) => (
                <div key={tag} className="neumo-inset" style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--olive-800)', fontFamily: 'var(--font-display)' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                    {tag}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dish Scores with Privacy Gate Status */}
          <div className="neumo-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--olive-900)', marginBottom: 14 }}>
              Dish-by-Dish Ratings & Privacy Gate Verification
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {insights.dish_scores.map((dish) => (
                <div
                  key={dish.dish_id}
                  className="neumo-inset"
                  style={{
                    padding: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.98rem', color: 'var(--olive-900)' }}>{dish.dish_name}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {dish.status_note}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {dish.sample_size_met ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#E8F5E9',
                        color: 'var(--veg-green)',
                        border: '1px solid #A5D6A7',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        fontSize: '0.95rem'
                      }}>
                        <CheckCircle2 size={16} />
                        <span>★ {dish.average_score}</span>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--olive-100)',
                        color: 'var(--olive-800)',
                        border: '1px solid var(--olive-200)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-pill)',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}>
                        <Lock size={14} />
                        <span>Gate Active ({dish.rating_count}/5 votes)</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
