import React, { useState, useEffect } from 'react';
import { HelpArticle } from '../../types';
import { api } from '../../services/api';
import { HelpCircle, Search, Compass, ChevronDown, ChevronUp, BookOpen, ShieldCheck } from 'lucide-react';

interface HelpPageProps {
  onStartTour: () => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onStartTour }) => {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('faq-anonymity');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await api.getHelpArticles(
          selectedRole !== 'all' ? selectedRole : undefined,
          searchQuery.trim() || undefined
        );
        setArticles(data);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [selectedRole, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="app-container">
      <div className="flex-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--olive-600)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
            <HelpCircle size={14} />
            <span>Knowledge Base & FAQs</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--olive-900)' }}>Help Centre & Guide</h1>
        </div>

        <button
          onClick={onStartTour}
          className="skeuo-btn spatial-btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Compass size={15} />
          <span>Replay Guided Tour</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="neumo-card" style={{ padding: 14, marginBottom: 18, position: 'relative' }}>
        <input
          type="text"
          placeholder="Search by topic, e.g. 'anonymity', 'skip cut-off', 'headcount'..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="neumo-input"
          style={{ paddingLeft: 38 }}
        />
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 26, top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      {/* Role Filter Chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Topics' },
          { id: 'student', label: '🎓 For Students' },
          { id: 'staff', label: '🍳 For Mess Staff' },
          { id: 'warden', label: '🛡️ For Wardens' }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setSelectedRole(btn.id)}
            className={`skeuo-btn ${selectedRole === btn.id ? 'skeuo-btn-secondary' : ''}`}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-full)',
              background: selectedRole === btn.id ? 'var(--olive-700)' : '#FFFFFF',
              color: selectedRole === btn.id ? '#FFFFFF' : 'var(--text-secondary)',
              borderColor: selectedRole === btn.id ? 'var(--olive-800)' : 'rgba(45, 74, 62, 0.15)'
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Articles Accordion */}
      {loading ? (
        <div className="neumo-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          Searching guide entries...
        </div>
      ) : articles.length === 0 ? (
        <div className="neumo-card" style={{ padding: 32, textAlign: 'center' }}>
          <HelpCircle size={36} color="var(--olive-400)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ marginBottom: 6 }}>No guide articles matched "{searchQuery}"</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Try searching for words like 'skip', 'rating', 'anonymity', or 'leftover'.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {articles.map((art) => {
            const isExpanded = expandedId === art.id;
            return (
              <div key={art.id} className="neumo-card" style={{ overflow: 'hidden' }}>
                <div
                  onClick={() => toggleExpand(art.id)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isExpanded ? 'rgba(45, 74, 62, 0.04)' : 'transparent',
                    borderBottom: isExpanded ? '1px solid rgba(45, 74, 62, 0.1)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--olive-100)',
                      color: 'var(--olive-800)',
                      border: '1px solid var(--olive-200)',
                      textTransform: 'uppercase'
                    }}>
                      {art.category}
                    </span>
                    <strong style={{ fontSize: '0.98rem', color: 'var(--olive-900)' }}>
                      {art.title}
                    </strong>
                  </div>

                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--olive-700)', cursor: 'pointer' }}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {isExpanded && (
                  <div style={{ padding: '16px 20px', background: '#FFFFFF', animation: 'fadeIn 0.15s ease' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--olive-800)', fontWeight: 600, marginBottom: 8 }}>
                      {art.summary}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {art.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
