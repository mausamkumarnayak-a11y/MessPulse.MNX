import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ActionItem, ActionStatus } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartHandshake, CheckCircle2, Clock, AlertCircle, 
  Plus, Edit3, MessageSquare, ArrowRight, Shield 
} from 'lucide-react';

export const ActionsTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'warden' || user?.role === 'admin';

  const [actions, setActions] = useState<ActionItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // New/Edit action modal state
  const [showModal, setShowModal] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ActionStatus>('open');
  const [outcome, setOutcome] = useState('');
  const [saving, setSaving] = useState(false);

  const loadActions = async () => {
    try {
      setLoading(true);
      const data = await api.listActions(
        filter !== 'all' ? (filter as ActionStatus) : undefined
      );
      setActions(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, [filter]);

  const handleOpenCreate = () => {
    setEditingActionId(null);
    setTitle('');
    setDescription('');
    setStatus('open');
    setOutcome('');
    setShowModal(true);
  };

  const handleOpenEdit = (action: ActionItem) => {
    setEditingActionId(action.id);
    setTitle(action.title);
    setDescription(action.description);
    setStatus(action.status);
    setOutcome(action.outcome || '');
    setShowModal(true);
  };

  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSaving(true);
    try {
      if (editingActionId) {
        await api.updateAction(editingActionId, {
          title: title.trim(),
          description: description.trim(),
          status,
          outcome: outcome.trim() || undefined
        });
      } else {
        await api.createAction({
          title: title.trim(),
          description: description.trim(),
          status,
          outcome: outcome.trim() || undefined
        });
      }
      setShowModal(false);
      loadActions();
    } catch (err: any) {
      alert(err.message || 'Failed to save action');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      <div className="flex-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--olive-600)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
            <HeartHandshake size={14} />
            <span>Closed Feedback Loop</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--olive-900)' }}>You Said, We Did</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Public transparency log showing real changes enacted from student mess ratings.
          </p>
        </div>

        {isManager && (
          <button
            onClick={handleOpenCreate}
            className="skeuo-btn spatial-btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Log New Action</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Actions' },
          { id: 'resolved', label: '✓ Resolved' },
          { id: 'in_progress', label: '⏳ In Progress' },
          { id: 'open', label: '📋 Under Review' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`skeuo-btn ${filter === tab.id ? 'skeuo-btn-secondary' : ''}`}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-full)',
              background: filter === tab.id ? 'var(--olive-700)' : '#FFFFFF',
              color: filter === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
              borderColor: filter === tab.id ? 'var(--olive-800)' : 'rgba(45, 74, 62, 0.15)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="neumo-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading action items...
        </div>
      ) : actions.length === 0 ? (
        <div className="neumo-card" style={{ padding: 32, textAlign: 'center' }}>
          <HeartHandshake size={36} color="var(--olive-400)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ marginBottom: 6 }}>No actions match this filter</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Actions logged by mess management will appear here for all residents to see.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {actions.map((act) => (
            <div key={act.id} className="neumo-card" style={{ padding: 22 }}>
              <div className="flex-between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: act.status === 'resolved' ? '#E8F5E9' : act.status === 'in_progress' ? '#FEF3C7' : '#E2E8DE',
                    color: act.status === 'resolved' ? 'var(--veg-green)' : act.status === 'in_progress' ? '#B45309' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: act.status === 'resolved' ? '#A5D6A7' : act.status === 'in_progress' ? '#FDE68A' : '#CBD5E1'
                  }}>
                    {act.status === 'resolved' ? '✓ Resolved' : act.status === 'in_progress' ? '⏳ In Progress' : '📋 Under Review'}
                  </span>
                  {act.dish_name && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Linked to: <strong>{act.dish_name}</strong>
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    By {act.created_by} • {new Date(act.updated_at).toLocaleDateString()}
                  </span>
                  {isManager && (
                    <button
                      onClick={() => handleOpenEdit(act)}
                      className="skeuo-btn skeuo-btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: 6 }}
                      title="Edit Action"
                    >
                      <Edit3 size={13} />
                    </button>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: '1.15rem', color: 'var(--olive-900)', marginBottom: 6 }}>
                {act.title}
              </h3>

              <div style={{
                background: 'rgba(255, 255, 255, 0.5)',
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                marginBottom: 10,
                border: '1px solid rgba(45, 74, 62, 0.08)'
              }}>
                <strong style={{ color: 'var(--olive-800)', display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: 2 }}>
                  Student Issue Addressed:
                </strong>
                {act.description}
              </div>

              {act.outcome && (
                <div style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: '0.88rem',
                  color: '#166534'
                }}>
                  <strong style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: 2 }}>
                    Measured Outcome:
                  </strong>
                  ✨ {act.outcome}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Action Modal */}
      {showModal && createPortal(
        <div className="glass-modal-backdrop" onClick={() => setShowModal(false)} role="dialog" aria-modal="true">
          <div className="glass-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="glass-modal-header">
              <h3 style={{ fontSize: '1.25rem', color: 'var(--olive-900)', margin: 0 }}>
                {editingActionId ? 'Update Action Item' : 'Publish "You Said, We Did" Action'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '1.2rem',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAction} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="glass-modal-body">
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Action Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Reduced salt in Dal Tadka recipe"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="neumo-input"
                    required
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    What Feedback Prompted This?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. 24 student comments on Tuesday highlighting saltiness..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="neumo-input"
                    required
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ActionStatus)}
                    className="neumo-input"
                  >
                    <option value="open">Under Review</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                    Outcome / Resolution Result (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Adjusted spice blend; salt complaints dropped from 40% to 2%."
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    className="neumo-input"
                  />
                </div>
              </div>

              <div className="glass-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="skeuo-btn skeuo-btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="skeuo-btn spatial-btn-primary"
                  style={{ flex: 1 }}
                >
                  {saving ? 'Saving...' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
