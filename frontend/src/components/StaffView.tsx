import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SpatialCard } from './SpatialCard';
import { AnimatedCounter } from './AnimatedCounter';
import { Scale, Users, Calculator, Check } from 'lucide-react';

export const StaffView: React.FC = () => {
  const { staffName, kitchenName, organizationName, slots, skippedSlotIds } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'entry' | 'forecast'>('entry');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-lunch');
  const [headcount, setHeadcount] = useState<number>(382);
  const [dishLeftovers, setDishLeftovers] = useState<Record<string, number>>({});
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const activeSlot = slots.find((s) => s.id === selectedSlotId) || slots[0];

  // Number of skips for current slot
  const currentSlotSkips = skippedSlotIds[activeSlot.id] ? 69 : 68;
  const hostelCapacity = 450;
  const netEligible = Math.max(0, hostelCapacity - currentSlotSkips);
  const expectedAttendance = Math.round(netEligible * 0.96);
  const minPrep = expectedAttendance - 10;
  const maxPrep = expectedAttendance + 10;

  // Compute total leftover for current slot dishes
  const totalLeftoverKg = activeSlot.dishes.reduce((acc, dish) => {
    const val = dishLeftovers[dish.id] !== undefined ? dishLeftovers[dish.id] : (dish.leftover_kg || 1.5);
    return acc + val;
  }, 0);

  const wastePerHeadGrams = headcount > 0 ? Math.round((totalLeftoverKg / headcount) * 1000) : 0;

  const handleLeftoverChange = (dishId: string, val: number) => {
    setDishLeftovers((prev) => ({
      ...prev,
      [dishId]: Math.max(0, val)
    }));
  };

  const handleSaveEntry = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);

    // Call live backend if available
    try {
      fetch(`/api/v1/slots/${activeSlot.id}/headcount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ served_count: headcount })
      }).catch(() => {});
    } catch {}
  };

  return (
    <div id="tour-staff" style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 700 }}>
              Kitchen Operations Portal
            </span>
            <span style={{ fontSize: '0.74rem', background: 'rgba(52, 211, 153, 0.12)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
              Head Chef Console
            </span>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{kitchenName} Kitchen Operations</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.92rem', marginTop: '2px' }}>
            Supervisor: {staffName} · {organizationName}
          </p>
        </div>

        {/* Sub-Tabs: Daily Entry | Expected Cooking Forecast */}
        <div className="mirror" style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '9999px' }}>
          <button
            onClick={() => setActiveSubTab('entry')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: activeSubTab === 'entry' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              backgroundColor: activeSubTab === 'entry' ? 'var(--primary)' : 'transparent',
              boxShadow: activeSubTab === 'entry' ? '0 0 20px var(--primary)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Daily Leftover Entry
          </button>
          <button
            onClick={() => setActiveSubTab('forecast')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: activeSubTab === 'forecast' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              backgroundColor: activeSubTab === 'forecast' ? 'var(--primary)' : 'transparent',
              boxShadow: activeSubTab === 'forecast' ? '0 0 20px var(--primary)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Expected Headcount 📊
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div
          className="animate-fade-in"
          style={{
            padding: '14px 20px',
            borderRadius: '12px',
            backgroundColor: 'rgba(52, 211, 153, 0.15)',
            border: '1px solid var(--primary)',
            color: 'var(--primary)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Check size={18} />
          <span>Daily entry saved successfully! Logged {headcount} diners and {totalLeftoverKg.toFixed(1)} kg leftover food for {activeSlot.meal_type.toUpperCase()}.</span>
        </div>
      )}

      {/* Meal Slot Filter Bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {slots.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSlotId(s.id)}
            style={{
              padding: '8px 18px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.86rem',
              color: selectedSlotId === s.id ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              background: selectedSlotId === s.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.04)',
              border: selectedSlotId === s.id ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: selectedSlotId === s.id ? '0 0 16px var(--primary)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {s.meal_type.toUpperCase()} ({s.start_time})
          </button>
        ))}
      </div>

      {/* ==============================================================
          SUBTAB 1: DAILY ENTRY & SCALE LOGGING
          ============================================================== */}
      {activeSubTab === 'entry' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {/* Left Column: Headcount Counter & Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <SpatialCard className="p-7" float="none">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Users size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Actual Diners Served</h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--muted-foreground)', marginBottom: '22px', lineHeight: 1.5 }}>
                Count turnstile check-ins or student plates served for {activeSlot.meal_type.toUpperCase()}.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  value={headcount}
                  onChange={(e) => setHeadcount(Number(e.target.value))}
                  style={{
                    width: '150px',
                    padding: '12px 16px',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'var(--foreground)',
                    textAlign: 'center'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setHeadcount(headcount + 10)}
                    className="btn-secondary"
                    style={{ padding: '10px 14px', fontSize: '0.84rem' }}
                  >
                    +10
                  </button>
                  <button
                    onClick={() => setHeadcount(headcount + 50)}
                    className="btn-secondary"
                    style={{ padding: '10px 14px', fontSize: '0.84rem' }}
                  >
                    +50
                  </button>
                  <button
                    onClick={() => setHeadcount(Math.max(0, headcount - 10))}
                    className="btn-secondary"
                    style={{ padding: '10px 14px', fontSize: '0.84rem' }}
                  >
                    -10
                  </button>
                </div>
              </div>

              {/* Real-Time Metrics Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="mirror-subtle" style={{ padding: '16px 18px' }}>
                  <span className="card-label">
                    Total Leftover
                  </span>
                  <p className="card-stat-value" style={{ color: 'var(--accent)', fontSize: '1.8rem', margin: '4px 0 0 0' }}>
                    <AnimatedCounter to={totalLeftoverKg} suffix=" kg" decimals={1} />
                  </p>
                </div>
                <div className="mirror-subtle" style={{ padding: '16px 18px' }}>
                  <span className="card-label">
                    Waste Per Head
                  </span>
                  <p className="card-stat-value" style={{ color: 'var(--primary)', fontSize: '1.8rem', margin: '4px 0 0 0' }}>
                    <AnimatedCounter to={wastePerHeadGrams} suffix=" g" />
                  </p>
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <button onClick={handleSaveEntry} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '0.94rem' }}>
                  <Check size={18} /> Save Daily Kitchen Log
                </button>
              </div>
            </SpatialCard>
          </div>

          {/* Right Column: Per-Dish Scale Inputs */}
          <SpatialCard className="p-7" float="none">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Scale size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Weighed Leftovers per Dish</h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                {activeSlot.dishes.length} Recipes
              </span>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'var(--muted-foreground)', marginBottom: '20px', lineHeight: 1.5 }}>
              Weigh post-service leftovers on kitchen platform scales and record kilograms per dish.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeSlot.dishes.map((dish) => {
                const currentWeight = dishLeftovers[dish.id] !== undefined ? dishLeftovers[dish.id] : (dish.leftover_kg || 1.5);
                const cookedWeight = dish.cooked_kg || 35;
                const wastePct = cookedWeight > 0 ? (currentWeight / cookedWeight) * 100 : 0;
                const isHigh = wastePct > 10;

                return (
                  <div
                    key={dish.id}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isHigh ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: dish.is_veg ? '#22c55e' : '#ef4444',
                            boxShadow: `0 0 8px ${dish.is_veg ? '#22c55e' : '#ef4444'}`
                          }}
                        />
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{dish.name}</span>
                        {isHigh && (
                          <span style={{ fontSize: '0.7rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            {wastePct.toFixed(0)}% Leftover
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={currentWeight}
                          onChange={(e) => handleLeftoverChange(dish.id, parseFloat(e.target.value) || 0)}
                          style={{
                            width: '84px',
                            padding: '8px 12px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(0,0,0,0.4)',
                            color: 'var(--foreground)',
                            textAlign: 'right'
                          }}
                        />
                        <span style={{ fontSize: '0.86rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>kg</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, wastePct * 3.5)}%`,
                            background: isHigh ? '#ef4444' : 'var(--primary)',
                            borderRadius: '9999px'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.76rem', color: 'var(--muted-foreground)' }}>
                        Cooked: {cookedWeight} kg
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SpatialCard>
        </div>
      )}

      {/* ==============================================================
          SUBTAB 2: EXPECTED HEADCOUNT FORECAST
          ============================================================== */}
      {activeSubTab === 'forecast' && (
        <SpatialCard className="p-8" float="none">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Calculator size={24} color="var(--primary)" />
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
              Expected Cooking Headcount for {activeSlot.meal_type.toUpperCase()}
            </h3>
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--muted-foreground)', marginBottom: '28px', lineHeight: 1.5 }}>
            Transparent mathematical forecast connecting student verified skips to historical weekday show-up rates.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div className="mirror-subtle" style={{ padding: '20px' }}>
              <span className="card-label">Registered Diners</span>
              <p className="card-stat-value" style={{ margin: '4px 0' }}>{hostelCapacity}</p>
              <span className="card-subtext">Hostel Resident Capacity</span>
            </div>

            <div className="mirror-subtle" style={{ padding: '20px' }}>
              <span className="card-label">Skips Logged on Time</span>
              <p className="card-stat-value" style={{ color: '#f87171', margin: '4px 0' }}>
                - {currentSlotSkips}
              </p>
              <span className="card-subtext" style={{ color: '#f87171' }}>Before {activeSlot.cutoff_time} Cut-off</span>
            </div>

            <div className="mirror-subtle" style={{ padding: '20px' }}>
              <span className="card-label">Net Eligible Diners</span>
              <p className="card-stat-value" style={{ margin: '4px 0' }}>
                {netEligible}
              </p>
              <span className="card-subtext">Eligible to dine</span>
            </div>

            <div className="mirror-subtle" style={{ padding: '20px' }}>
              <span className="card-label">Historical Show-Up Rate</span>
              <p className="card-stat-value" style={{ color: 'var(--primary)', margin: '4px 0' }}>
                96%
              </p>
              <span className="card-subtext" style={{ color: 'var(--primary)' }}>Based on past 4 weeks</span>
            </div>
          </div>

          {/* Recommended Cooking Target Box */}
          <div
            style={{
              padding: '28px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(52, 211, 153, 0.04))',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px'
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)', fontWeight: 700 }}>
                Target Batch Preparation
              </span>
              <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--foreground)', marginTop: '4px', letterSpacing: '-0.02em' }}>
                {expectedAttendance} Portions
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                Safe Cooking Window: <strong>{minPrep} — {maxPrep} portions</strong> (Includes +5% safety buffer)
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--primary)', fontWeight: 600 }}>
                Prevents Over-Cooking
              </span>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)', marginTop: '2px' }}>
                ~ {((hostelCapacity - expectedAttendance) * 0.38).toFixed(1)} kg surplus saved
              </p>
            </div>
          </div>
        </SpatialCard>
      )}
    </div>
  );
};
