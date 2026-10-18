import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { WasteInsights, RatingsInsights, ActionItem } from '../../types';
import { 
  Shield, BarChart3, Star, HeartHandshake, Utensils, 
  ArrowRight, Users, Scale, CheckCircle2 
} from 'lucide-react';

export const WardenOverview: React.FC = () => {
  const [waste, setWaste] = useState<WasteInsights | null>(null);
  const [ratings, setRatings] = useState<RatingsInsights | null>(null);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const [w, r, a] = await Promise.all([
          api.getWasteInsights(),
          api.getRatingsInsights(),
          api.listActions()
        ]);
        setWaste(w);
        setRatings(r);
        setActions(a);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  return (
    <div className="app-container">
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--olive-600)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
          <Shield size={14} />
          <span>Administration Portal</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--olive-900)' }}>Hostel Mess Overview</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Real-time accountability, vendor oversight, and food-waste reduction control.
        </p>
      </div>

      {loading ? (
        <div className="neumo-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading administrative metrics...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Stat Highlights */}
          <div className="grid-3">
            <div className="neumo-card" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Food Waste This Month
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--olive-900)', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
                {waste?.total_waste_kg || 0} kg
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--veg-green)', fontWeight: 600 }}>
                {waste?.waste_per_head_kg || 0} kg per student meal
              </div>
            </div>

            <div className="neumo-card" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Overall Mess Rating
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--olive-600)', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
                {ratings?.overall_average_score ? `★ ${ratings.overall_average_score}` : 'Withheld'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {ratings?.total_ratings_count || 0} anonymous reviews
              </div>
            </div>

            <div className="neumo-card" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Actions Published
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--olive-700)', fontFamily: 'var(--font-display)', margin: '4px 0' }}>
                {actions.length}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--veg-green)', fontWeight: 600 }}>
                {actions.filter((a) => a.status === 'resolved').length} resolved issues
              </div>
            </div>
          </div>

          {/* Navigation Hub */}
          <div className="neumo-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--olive-900)', marginBottom: 16 }}>
              Administrative Workflows
            </h3>
            <div className="grid-2" style={{ gap: 14 }}>
              <Link to="/warden/waste" style={{ textDecoration: 'none' }}>
                <div className="neumo-inset" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <BarChart3 size={24} color="var(--olive-700)" />
                    <div>
                      <strong style={{ fontSize: '0.98rem', color: 'var(--olive-900)' }}>Waste Trends & Ranks</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Weighed leftovers per dish</div>
                    </div>
                  </div>
                  <ArrowRight size={18} color="var(--olive-700)" />
                </div>
              </Link>

              <Link to="/warden/ratings" style={{ textDecoration: 'none' }}>
                <div className="neumo-inset" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Star size={24} color="var(--olive-600)" />
                    <div>
                      <strong style={{ fontSize: '0.98rem', color: 'var(--olive-900)' }}>Ratings & Privacy Gate</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Enforce 5-rating sample threshold</div>
                    </div>
                  </div>
                  <ArrowRight size={18} color="var(--olive-600)" />
                </div>
              </Link>

              <Link to="/actions" style={{ textDecoration: 'none' }}>
                <div className="neumo-inset" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <HeartHandshake size={24} color="var(--veg-green)" />
                    <div>
                      <strong style={{ fontSize: '0.98rem', color: 'var(--olive-900)' }}>Action Tracker</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Publish "You said, we did" items</div>
                    </div>
                  </div>
                  <ArrowRight size={18} color="var(--veg-green)" />
                </div>
              </Link>

              <Link to="/staff/menu" style={{ textDecoration: 'none' }}>
                <div className="neumo-inset" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Utensils size={24} color="var(--olive-800)" />
                    <div>
                      <strong style={{ fontSize: '0.98rem', color: 'var(--olive-900)' }}>Menu Management</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Update dishes and specials</div>
                    </div>
                  </div>
                  <ArrowRight size={18} color="var(--olive-800)" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
