import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SpatialCard } from './SpatialCard';
import { AnimatedCounter } from './AnimatedCounter';
import { 
  CalendarX2, Utensils, CheckCircle2, Clock, Sparkles, 
  Award, Check, Shield 
} from 'lucide-react';

const EMOJIS = [
  { score: 1, emoji: '😖', label: 'Terrible' },
  { score: 2, emoji: '😕', label: 'Poor' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😍', label: 'Delicious' }
];

const QUICK_TAGS = [
  'Perfect Taste', 'Too Salty', 'Oily', 'Fresh & Hot', 'Lukewarm', 
  'Great Portion', 'Needs Spice', 'Lighter Oil Please', 'Crispy & Good'
];

export const StudentView: React.FC = () => {
  const { studentName, kitchenName, organizationName, slots, skippedSlotIds, toggleSkipSlot, ratings, submitRating } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'menu' | 'skip' | 'impact'>('menu');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-lunch');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const activeSlot = slots.find((s) => s.id === selectedSlotId) || slots[0];
  const currentSlotRating = ratings[selectedSlotId];

  // Calculate personal impact stats based on skipped slots
  const totalSkipsCount = Object.values(skippedSlotIds).filter(Boolean).length;
  const kgSaved = Number((totalSkipsCount * 0.38).toFixed(2));
  const rupeesSaved = totalSkipsCount * 45;
  const co2Saved = Number((kgSaved * 2.5).toFixed(1));

  const handleRatingClick = (score: number) => {
    submitRating(selectedSlotId, score, selectedTags);
    setFeedbackNotice(`Rated ${activeSlot.meal_type.toUpperCase()} ${score}/5 stars! Securely stored in privacy ledger.`);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSkipClick = (slotId: string, mealType: string) => {
    const isCurrentlySkipped = !!skippedSlotIds[slotId];
    toggleSkipSlot(slotId);

    if (!isCurrentlySkipped) {
      setFeedbackNotice(`Marked ${mealType.toUpperCase()} as skipped. Kitchen portions adjusted!`);
    } else {
      setFeedbackNotice(`Skip canceled for ${mealType.toUpperCase()}. Your plate is reserved!`);
    }

    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Student Welcome Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 700 }}>
              Student Dining Dashboard
            </span>
            <span style={{ fontSize: '0.74rem', background: 'rgba(52, 211, 153, 0.12)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
              Verified Resident
            </span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Welcome, {studentName} 👋</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.92rem', marginTop: '2px' }}>
            {kitchenName} Kitchen · {organizationName}
          </p>
        </div>

        {/* Sub-Tabs: Menu & Rating | Skip RSVP | My Impact */}
        <div className="mirror" style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '9999px' }}>
          <button
            onClick={() => setActiveSubTab('menu')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: activeSubTab === 'menu' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              backgroundColor: activeSubTab === 'menu' ? 'var(--primary)' : 'transparent',
              boxShadow: activeSubTab === 'menu' ? '0 0 20px var(--primary)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Today's Menu & Rating
          </button>
          <button
            onClick={() => setActiveSubTab('skip')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: activeSubTab === 'skip' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              backgroundColor: activeSubTab === 'skip' ? 'var(--primary)' : 'transparent',
              boxShadow: activeSubTab === 'skip' ? '0 0 20px var(--primary)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Skip-a-Meal ({totalSkipsCount} Skipped)
          </button>
          <button
            onClick={() => setActiveSubTab('impact')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: activeSubTab === 'impact' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              backgroundColor: activeSubTab === 'impact' ? 'var(--primary)' : 'transparent',
              boxShadow: activeSubTab === 'impact' ? '0 0 20px var(--primary)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            My Impact 🌱
          </button>
        </div>
      </div>

      {/* Floating Notice Banner */}
      {feedbackNotice && (
        <div
          className="animate-fade-in"
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            background: 'rgba(52, 211, 153, 0.15)',
            border: '1px solid var(--primary)',
            color: 'var(--primary)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* ==============================================================
          TAB 1: TODAY'S MENU & 5-SEC ONE-TAP RATING
          ============================================================== */}
      {activeSubTab === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Meal Service Picker */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {slots.map((s) => {
              const isSelected = selectedSlotId === s.id;
              const isSlotSkipped = !!skippedSlotIds[s.id];

              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSlotId(s.id)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '14px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                    background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: isSelected ? '0 0 20px var(--primary)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{s.meal_type.toUpperCase()}</span>
                  <span style={{ fontSize: '0.74rem', opacity: isSelected ? 0.9 : 0.6 }}>
                    ({s.start_time})
                  </span>
                  {isSlotSkipped && (
                    <span style={{ fontSize: '0.68rem', background: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', padding: '1px 6px', borderRadius: '4px' }}>
                      SKIPPED
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Grid Layout: Menu Spread + Rating Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            {/* Left: Recipe Spread */}
            <SpatialCard className="p-7" float="none">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Utensils size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                    {activeSlot.meal_type.charAt(0).toUpperCase() + activeSlot.meal_type.slice(1)} Menu ({activeSlot.dishes.length} Recipes)
                  </h3>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                  {activeSlot.start_time} — {activeSlot.end_time}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeSlot.dishes.map((dish) => (
                  <div
                    key={dish.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <span
                        style={{
                          width: '11px',
                          height: '11px',
                          borderRadius: '50%',
                          backgroundColor: dish.is_veg ? '#22c55e' : '#ef4444',
                          boxShadow: `0 0 8px ${dish.is_veg ? '#22c55e' : '#ef4444'}`,
                          flexShrink: 0
                        }}
                        title={dish.is_veg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
                      />
                      <span style={{ fontWeight: 600, fontSize: '0.96rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dish.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--muted-foreground)', background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: '6px', flexShrink: 0 }}>
                      {dish.category}
                    </span>
                  </div>
                ))}
              </div>

              {/* Anonymity Banner */}
              <div style={{ marginTop: '26px', padding: '16px 18px', borderRadius: '14px', background: 'rgba(52, 211, 153, 0.07)', border: '1px solid rgba(52, 211, 153, 0.25)', fontSize: '0.82rem', color: 'var(--primary)', display: 'flex', gap: '12px', alignItems: 'center', lineHeight: 1.5 }}>
                <Shield size={22} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Privacy Guaranteed:</strong> Ratings are 100% anonymous. Feedback is only revealed after 5 ratings are collected to protect individual student identity.
                </span>
              </div>
            </SpatialCard>

            {/* Right: 5-Second One-Tap Rating Panel */}
            <SpatialCard id="tour-rating" className="p-7" float="none">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  5-Second Rating ({activeSlot.meal_type.toUpperCase()})
                </h3>
                {currentSlotRating && (
                  <span style={{ fontSize: '0.76rem', background: 'rgba(52, 211, 153, 0.2)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700 }}>
                    Rated: {currentSlotRating.score}/5 ★
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.86rem', color: 'var(--muted-foreground)', marginBottom: '22px', lineHeight: 1.5 }}>
                Tap an emoji to rate. Takes under 5 seconds and directly influences chef recipe adjustments.
              </p>

              {/* 5 Emojis */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '24px' }}>
                {EMOJIS.map((item) => {
                  const isSelected = currentSlotRating?.score === item.score;

                  return (
                    <button
                      key={item.score}
                      onClick={() => handleRatingClick(item.score)}
                      style={{
                        padding: '14px 4px',
                        borderRadius: '16px',
                        background: isSelected ? 'rgba(52, 211, 153, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: isSelected ? '0 0 20px var(--primary)' : 'none',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{item.emoji}</span>
                      <span style={{ fontSize: '0.7rem', color: isSelected ? 'var(--primary)' : 'var(--muted-foreground)', fontWeight: 700, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback Tags */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Quick tags (tap to add):
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {QUICK_TAGS.map((tag) => {
                    const isActive = selectedTags.includes(tag) || currentSlotRating?.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`tag-pill ${isActive ? 'active' : ''}`}
                      >
                        {isActive && <Check size={12} />} {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {currentSlotRating && (
                <div
                  className="animate-fade-in"
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(52, 211, 153, 0.12)',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: 'auto'
                  }}
                >
                  <Sparkles size={18} style={{ flexShrink: 0 }} />
                  <span>Rating saved! Warden action log updated when 5 reviews are reached.</span>
                </div>
              )}
            </SpatialCard>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 2: SKIP-A-MEAL (INDEPENDENT PER-SLOT RSVP!)
          ============================================================== */}
      {activeSubTab === 'skip' && (
        <div id="tour-skip" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Info Card */}
          <div className="mirror-subtle" style={{ padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <CalendarX2 size={28} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
              <strong>How Cut-off Enforcement Works:</strong> Mark meals you plan not to eat before each service cut-off. 
              The kitchen adjusts batch preparation numbers so food is not wasted. You may undo a skip anytime before the cut-off.
            </div>
          </div>

          {/* List of ALL 4 Meal Slots */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {slots.map((slot) => {
              const isSlotSkipped = !!skippedSlotIds[slot.id];

              return (
                <SpatialCard key={slot.id} className="p-7" float="none">
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                    {/* Left: Meal info */}
                    <div style={{ flex: '1 1 300px', minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, textTransform: 'capitalize' }}>
                          {slot.meal_type}
                        </h3>
                        <span style={{ fontSize: '0.86rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                          {slot.start_time} — {slot.end_time}
                        </span>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            backgroundColor: isSlotSkipped ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                            color: isSlotSkipped ? '#fca5a5' : '#86efac',
                            border: `1px solid ${isSlotSkipped ? '#ef4444' : '#22c55e'}`
                          }}
                        >
                          {isSlotSkipped ? 'SKIPPED' : 'PLATE RESERVED'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--accent)', marginBottom: '8px' }}>
                        <Clock size={15} />
                        <span>Cut-off Time: {slot.cutoff_time} (Preparation starts after this)</span>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                        <strong>Menu:</strong> {slot.dishes.map((d) => d.name).join(', ')}
                      </p>
                    </div>

                    {/* Right: Independent Skip / Undo Button */}
                    <button
                      onClick={() => handleSkipClick(slot.id, slot.meal_type)}
                      style={{
                        padding: '14px 28px',
                        borderRadius: '16px',
                        fontWeight: 700,
                        fontSize: '0.94rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: isSlotSkipped
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(52, 211, 153, 0.15)',
                        color: isSlotSkipped ? '#fca5a5' : 'var(--primary)',
                        border: isSlotSkipped
                          ? '1px solid #ef4444'
                          : '1px solid var(--primary)',
                        boxShadow: isSlotSkipped ? 'none' : '0 0 15px rgba(52, 211, 153, 0.2)',
                        flexShrink: 0
                      }}
                    >
                      {isSlotSkipped ? (
                        <>
                          <Check size={18} /> Skipped (Click to Undo)
                        </>
                      ) : (
                        <>
                          <CalendarX2 size={18} /> Skip This Meal
                        </>
                      )}
                    </button>
                  </div>
                </SpatialCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 3: MY IMPACT
          ============================================================== */}
      {activeSubTab === 'impact' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Key Metric Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '22px' }}>
            <SpatialCard className="p-6" float="none">
              <span className="card-label">
                Meals Skipped on Time
              </span>
              <p className="card-stat-value" style={{ color: 'var(--foreground)' }}>
                <AnimatedCounter to={totalSkipsCount} suffix=" meals" />
              </p>
              <span className="card-subtext" style={{ color: 'var(--primary)', marginTop: 'auto' }}>
                Prevented over-cooking in advance
              </span>
            </SpatialCard>

            <SpatialCard className="p-6" float="none">
              <span className="card-label">
                Food Waste Avoided
              </span>
              <p className="card-stat-value" style={{ color: 'var(--primary)' }}>
                <AnimatedCounter to={kgSaved} suffix=" kg" decimals={2} />
              </p>
              <span className="card-subtext" style={{ color: '#22c55e', marginTop: 'auto' }}>
                Direct kitchen scale weight savings
              </span>
            </SpatialCard>

            <SpatialCard className="p-6" float="none">
              <span className="card-label">
                Estimated Rebate / Credit
              </span>
              <p className="card-stat-value" style={{ color: 'var(--accent)' }}>
                <AnimatedCounter to={rupeesSaved} prefix="₹ " />
              </p>
              <span className="card-subtext" style={{ color: 'var(--accent)', marginTop: 'auto' }}>
                Calculated hostel mess bill rebate
              </span>
            </SpatialCard>

            <SpatialCard className="p-6" float="none">
              <span className="card-label">
                Carbon Offset
              </span>
              <p className="card-stat-value" style={{ color: '#4ade80' }}>
                <AnimatedCounter to={co2Saved} suffix=" kg" decimals={1} />
              </p>
              <span className="card-subtext" style={{ color: '#4ade80', marginTop: 'auto' }}>
                Equivalent greenhouse gas emissions cut
              </span>
            </SpatialCard>
          </div>

          {/* Eco Badges Milestone */}
          <SpatialCard className="p-8" float="none">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
              <Award size={24} color="var(--primary)" />
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Student Sustainability Milestones</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                <span style={{ fontSize: '2rem' }}>🎖️</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '8px 0 4px 0' }}>Zero-Waste Hero</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                  Awarded for logging 5+ timely meal skips before the 2-hour cooking cut-off.
                </p>
              </div>

              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <span style={{ fontSize: '2rem' }}>⭐</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '8px 0 4px 0' }}>Taste Sentinel</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                  Awarded for consistent constructive feedback tags helping cooks refine recipe spices.
                </p>
              </div>

              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span style={{ fontSize: '2rem' }}>🌱</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '8px 0 4px 0' }}>Green Campus Pioneer</h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                  Awarded to students contributing to {organizationName}'s carbon neutral mission.
                </p>
              </div>
            </div>
          </SpatialCard>
        </div>
      )}
    </div>
  );
};
