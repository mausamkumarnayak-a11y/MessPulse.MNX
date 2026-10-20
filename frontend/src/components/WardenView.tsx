import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SpatialCard } from './SpatialCard';
import { AnimatedCounter } from './AnimatedCounter';
import { Lock, Plus } from 'lucide-react';

export const WardenView: React.FC = () => {
  const { wardenName, kitchenName, organizationName, actions, addAction, updateActionStatus } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'ratings' | 'actions'>('analytics');
  const [actionFilter, setActionFilter] = useState<'all' | 'resolved' | 'in_progress' | 'planned'>('all');
  
  // New Action Form Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [actionInput, setActionInput] = useState<string>('');
  const [impactInput, setImpactInput] = useState<string>('');
  const [statusInput, setStatusInput] = useState<'resolved' | 'in_progress' | 'planned'>('resolved');

  const filteredActions = actionFilter === 'all' ? actions : actions.filter((a) => a.status === actionFilter);

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackInput.trim() || !actionInput.trim()) return;

    addAction({
      student_feedback: feedbackInput.trim(),
      action_taken: actionInput.trim(),
      status: statusInput,
      impact_summary: impactInput.trim() || 'Logged in public accountability tracker.'
    });

    setFeedbackInput('');
    setActionInput('');
    setImpactInput('');
    setShowAddModal(false);
  };

  // 7-Day History Sample
  const dailyHistory = [
    { day: 'Wed', date: 'Oct 14', waste_kg: 39.0, headcount: 1400, waste_per_head: 28 },
    { day: 'Thu', date: 'Oct 15', waste_kg: 43.8, headcount: 1432, waste_per_head: 31 },
    { day: 'Fri', date: 'Oct 16', waste_kg: 29.4, headcount: 1464, waste_per_head: 20 },
    { day: 'Sat', date: 'Oct 17', waste_kg: 34.2, headcount: 1496, waste_per_head: 23 },
    { day: 'Sun', date: 'Oct 18', waste_kg: 18.5, headcount: 950, waste_per_head: 19 },
    { day: 'Mon', date: 'Oct 19', waste_kg: 22.0, headcount: 1380, waste_per_head: 16 },
    { day: 'Tue', date: 'Oct 20', waste_kg: 15.5, headcount: 1410, waste_per_head: 11 }
  ];

  return (
    <div id="tour-warden" style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 700 }}>
              Warden Administration Console
            </span>
            <span style={{ fontSize: '0.74rem', background: 'rgba(52, 211, 153, 0.12)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
              Chief Warden
            </span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{kitchenName} Oversight & Feedback Loop</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.92rem', marginTop: '2px' }}>
            Warden: {wardenName} · {organizationName}
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="mirror" style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '9999px' }}>
          <button
            onClick={() => setActiveSubTab('analytics')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: activeSubTab === 'analytics' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              backgroundColor: activeSubTab === 'analytics' ? 'var(--primary)' : 'transparent',
              boxShadow: activeSubTab === 'analytics' ? '0 0 20px var(--primary)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Waste Analytics
          </button>
          <button
            onClick={() => setActiveSubTab('ratings')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: activeSubTab === 'ratings' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              backgroundColor: activeSubTab === 'ratings' ? 'var(--primary)' : 'transparent',
              boxShadow: activeSubTab === 'ratings' ? '0 0 20px var(--primary)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Ratings & Privacy Gate 🔒
          </button>
          <button
            onClick={() => setActiveSubTab('actions')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: activeSubTab === 'actions' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              backgroundColor: activeSubTab === 'actions' ? 'var(--primary)' : 'transparent',
              boxShadow: activeSubTab === 'actions' ? '0 0 20px var(--primary)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Action Tracker ({actions.length})
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '22px' }}>
        <SpatialCard className="p-6" float="none">
          <span className="card-label">
            Total Weekly Leftover
          </span>
          <p className="card-stat-value" style={{ color: 'var(--primary)' }}>
            <AnimatedCounter to={202.4} suffix=" kg" decimals={1} />
          </p>
          <span className="card-subtext" style={{ color: '#22c55e', marginTop: 'auto' }}>
            ▼ 34% reduction vs baseline
          </span>
        </SpatialCard>

        <SpatialCard className="p-6" float="none">
          <span className="card-label">
            Average Waste Per Head
          </span>
          <p className="card-stat-value" style={{ color: 'var(--accent)' }}>
            <AnimatedCounter to={21.2} suffix=" g" decimals={1} />
          </p>
          <span className="card-subtext" style={{ marginTop: 'auto' }}>
            Fair comparison across busy & quiet days
          </span>
        </SpatialCard>

        <SpatialCard className="p-6" float="none">
          <span className="card-label">
            Student Satisfaction
          </span>
          <p className="card-stat-value" style={{ color: '#fbbf24' }}>
            4.4★
          </p>
          <span className="card-subtext" style={{ color: '#22c55e', marginTop: 'auto' }}>
            ▲ 0.6★ recovery this month
          </span>
        </SpatialCard>

        <SpatialCard className="p-6" float="none">
          <span className="card-label">
            Resolved Action Items
          </span>
          <p className="card-stat-value" style={{ color: 'var(--foreground)' }}>
            <AnimatedCounter to={actions.filter((a) => a.status === 'resolved').length} suffix=" items" />
          </p>
          <span className="card-subtext" style={{ color: 'var(--primary)', marginTop: 'auto' }}>
            Public accountability log
          </span>
        </SpatialCard>
      </div>

      {/* ==============================================================
          SUBTAB 1: WASTE ANALYTICS & 7-DAY TRENDS
          ============================================================== */}
      {activeSubTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* 7-Day Trend Bar Chart Card */}
          <SpatialCard className="p-8" float="none">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>7-Day Leftover Food Waste Trend</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                  Measured kitchen leftover weights (kg) and waste-per-head (g) for {kitchenName} mess.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
                <span>Weighed Kilograms</span>
              </div>
            </div>

            {/* Custom Spatial Bar Visualization */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '16px', alignItems: 'flex-end', height: '240px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {dailyHistory.map((item) => {
                const heightPct = Math.round((item.waste_kg / 45) * 100);

                return (
                  <div key={item.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {item.waste_kg} kg
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '48px',
                        height: `${heightPct}%`,
                        borderRadius: '8px 8px 0 0',
                        background: 'linear-gradient(180deg, var(--primary) 0%, rgba(52, 211, 153, 0.25) 100%)',
                        boxShadow: '0 0 16px rgba(52, 211, 153, 0.25)',
                        transition: 'height 0.4s ease'
                      }}
                      title={`${item.date} (${item.day}): ${item.waste_kg} kg waste, ${item.waste_per_head}g per head`}
                    />
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--foreground)', display: 'block' }}>
                        {item.day}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                        {item.waste_per_head}g/diner
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SpatialCard>

          {/* Top Wasted Recipes Ranking */}
          <SpatialCard className="p-8" float="none">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
              Top Wasted Recipes This Week
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted-foreground)', marginBottom: '24px' }}>
              Identify problem recipes and adjust batch sizing or ingredient proportions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: 'Steamed Jeera Basmati Rice', waste: '42.5 kg', diners: '1,420 diners', status: 'High Leftover', action: 'Reduce Thursday batch by 12 kg' },
                { name: 'Yellow Moong Dal Fry', waste: '28.2 kg', diners: '1,380 diners', status: 'Moderate', action: 'Standard portion control active' },
                { name: 'Paneer Butter Masala', waste: '12.4 kg', diners: '1,460 diners', status: 'Optimal', action: 'High student appetite' }
              ].map((item, i) => (
                <div
                  key={item.name}
                  style={{
                    padding: '18px 24px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.88rem' }}>
                      #{i + 1}
                    </span>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--foreground)' }}>{item.name}</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>{item.diners} served · Suggestion: {item.action}</p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.3rem', color: i === 0 ? '#f87171' : 'var(--primary)' }}>
                      {item.waste}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--muted-foreground)', display: 'block' }}>Total Leftover</span>
                  </div>
                </div>
              ))}
            </div>
          </SpatialCard>
        </div>
      )}

      {/* ==============================================================
          SUBTAB 2: RATINGS & 5-RATING PRIVACY GATE
          ============================================================== */}
      {activeSubTab === 'ratings' && (
        <SpatialCard className="p-8" float="none">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <Lock size={24} color="var(--primary)" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>5-Rating Privacy Gate Threshold</h3>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--muted-foreground)', marginBottom: '28px', lineHeight: 1.5 }}>
            To prevent retribution and protect student privacy, dish scores are withheld from wardens and staff until 
            a minimum of <strong>5 independent ratings</strong> are collected for that recipe.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Dish 1: Gate Passed */}
            <div
              style={{
                padding: '22px',
                borderRadius: '16px',
                background: 'rgba(52, 211, 153, 0.08)',
                border: '1px solid rgba(52, 211, 153, 0.35)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Dal Tadka Special</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent)' }}>4.5 ★</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--primary)', marginTop: '8px', fontWeight: 600 }}>
                ✓ Gate Passed (6 ratings collected) · Transparent average revealed
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
                Tag Remarks: 4x "Perfect Taste", 2x "Fresh & Hot"
              </div>
            </div>

            {/* Dish 2: Gate Active (Masked) */}
            <div
              style={{
                padding: '22px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Paneer Butter Masala</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted-foreground)', background: 'rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: '6px' }}>
                  MASKED
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', marginTop: '8px' }}>
                🔒 2/5 ratings recorded · Average hidden until 3 more students rate
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
                Individual reviews stay sealed to protect student identity
              </div>
            </div>

            {/* Dish 3: Gate Active (Masked) */}
            <div
              style={{
                padding: '22px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Kadhai Chicken / Chaap</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted-foreground)', background: 'rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: '6px' }}>
                  MASKED
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', marginTop: '8px' }}>
                🔒 1/5 ratings recorded · Average hidden until 4 more students rate
              </p>
              <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
                Guarantees zero retaliation from mess contractor
              </div>
            </div>
          </div>
        </SpatialCard>
      )}

      {/* ==============================================================
          SUBTAB 3: "YOU SAID, WE DID" ACTION TRACKER
          ============================================================== */}
      {activeSubTab === 'actions' && (
        <SpatialCard id="tour-said" className="p-8" float="none">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>"You Said, We Did" Action Tracker</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                Transparent public accountability closing the feedback loop between student ratings and recipe improvements.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              style={{ gap: '8px', padding: '12px 22px' }}
            >
              <Plus size={18} /> Log New Action Item
            </button>
          </div>

          {/* Filter Status Pills */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {(['all', 'resolved', 'in_progress', 'planned'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setActionFilter(st)}
                className={`tag-pill ${actionFilter === st ? 'active' : ''}`}
                style={{ textTransform: 'capitalize', padding: '6px 14px', fontSize: '0.84rem' }}
              >
                {st === 'all' ? `All Actions (${actions.length})` : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Action Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {filteredActions.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '24px',
                  borderRadius: '18px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.04em' }}>
                    📣 STUDENT CONCERN ({item.date}):
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={item.status}
                      onChange={(e) => updateActionStatus(item.id, e.target.value as any)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background:
                          item.status === 'resolved'
                            ? 'rgba(34, 197, 94, 0.2)'
                            : item.status === 'in_progress'
                            ? 'rgba(251, 191, 36, 0.2)'
                            : 'rgba(255, 255, 255, 0.1)',
                        color:
                          item.status === 'resolved'
                            ? '#86efac'
                            : item.status === 'in_progress'
                            ? '#fde047'
                            : 'var(--muted-foreground)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="resolved">RESOLVED</option>
                      <option value="in_progress">IN PROGRESS</option>
                      <option value="planned">PLANNED</option>
                    </select>
                  </div>
                </div>

                <p style={{ fontWeight: 700, fontSize: '1.08rem', color: 'var(--foreground)', lineHeight: 1.45 }}>
                  "{item.student_feedback}"
                </p>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.04em' }}>
                    ✅ WARDEN ACTION TAKEN:
                  </span>
                  <p style={{ fontSize: '0.94rem', color: 'var(--muted-foreground)', marginTop: '4px', lineHeight: 1.55 }}>
                    {item.action_taken}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--primary)', marginTop: '6px', fontStyle: 'italic' }}>
                    Result: {item.impact_summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SpatialCard>
      )}

      {/* Log Action Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'grid',
            placeItems: 'center',
            padding: '16px'
          }}
        >
          <div
            className="mirror sheen animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '26px',
              borderRadius: '20px',
              background: 'rgba(16, 23, 34, 0.95)',
              border: '1px solid rgba(52, 211, 153, 0.3)'
            }}
          >
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '6px' }}>
              Log Warden Corrective Action
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--muted-foreground)', marginBottom: '18px' }}>
              Publish actions taken on student feedback to close the mess satisfaction loop.
            </p>

            <form onSubmit={handleCreateAction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
                  Student Feedback Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rice was overcooked on Monday lunch"
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'var(--foreground)',
                    fontSize: '0.92rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
                  Warden Action Taken
                </label>
                <textarea
                  placeholder="e.g. Shifted cooking time by 4 minutes and retrained rice cook on moisture sensor"
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'var(--foreground)',
                    fontSize: '0.92rem',
                    resize: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
                  Measured Result / Outcome
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rice waste dropped to under 3% with zero texture complaints"
                  value={impactInput}
                  onChange={(e) => setImpactInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'var(--foreground)',
                    fontSize: '0.92rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
                  Action Status
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: '#121824',
                    color: 'var(--foreground)',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="resolved">Resolved</option>
                  <option value="in_progress">In Progress</option>
                  <option value="planned">Planned</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Publish to Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
