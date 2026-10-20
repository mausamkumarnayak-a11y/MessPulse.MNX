import React, { useState, useEffect } from 'react';
import { SpatialCard } from './SpatialCard';
import { AnimatedCounter } from './AnimatedCounter';
import { Play, RotateCcw, Users, Scale, IndianRupee, Leaf } from 'lucide-react';

export const FoodWasteSimulator: React.FC = () => {
  const [totalStudents, setTotalStudents] = useState<number>(450);
  const [skipsCount, setSkipsCount] = useState<number>(68);
  const [bufferPercent, setBufferPercent] = useState<number>(8);
  const [dishRating, setDishRating] = useState<number>(4.2);

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simServed, setSimServed] = useState<number>(0);

  // Core Math Calculations
  const netEligible = Math.max(0, totalStudents - skipsCount);
  // Show up rate correlated slightly with rating (higher rating -> higher show-up)
  const showUpRate = Math.min(1.0, 0.88 + (dishRating - 3.0) * 0.04);
  const expectedAttendance = Math.round(netEligible * showUpRate);
  
  // Kitchen preparation with buffer
  const cookingPortions = Math.round(expectedAttendance * (1 + bufferPercent / 100));
  
  // Traditional blind cooking (full house + 15% blind buffer)
  const blindCookingPortions = Math.round(totalStudents * 1.15);
  
  // Leftover portions
  const actualEaters = expectedAttendance;
  const messPulseLeftoverPortions = Math.max(0, cookingPortions - actualEaters);
  const blindLeftoverPortions = Math.max(0, blindCookingPortions - actualEaters);

  // Conversion: 0.38 kg per meal portion average
  const PORTION_KG = 0.38;
  const COST_PER_KG = 62; // INR per kg raw cooked food average
  
  const messPulseWasteKg = Number((messPulseLeftoverPortions * PORTION_KG).toFixed(1));
  const blindWasteKg = Number((blindLeftoverPortions * PORTION_KG).toFixed(1));
  
  const dailyKgSaved = Math.max(0, Number((blindWasteKg - messPulseWasteKg).toFixed(1)));
  const dailyMoneySaved = Math.round(dailyKgSaved * COST_PER_KG);
  const annualMoneySaved = dailyMoneySaved * 300; // 300 operational mess days
  const co2KgSaved = Math.round(dailyKgSaved * 2.5 * 300); // 2.5 kg CO2 per kg food waste

  // Simulation run handler
  const startSimulation = () => {
    setIsSimulating(true);
    setSimProgress(0);
    setSimServed(0);
  };

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 100) {
          setIsSimulating(false);
          clearInterval(interval);
          return 100;
        }
        const next = prev + 4;
        setSimServed(Math.round((next / 100) * actualEaters));
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isSimulating, actualEaters]);

  return (
    <div id="tour-simulator" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Simulation Hero Panel */}
      <SpatialCard className="p-8" float="none">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 700 }}>
                Predictive Digital Twin
              </span>
            </div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800 }}>Live Food Waste & Cost Simulator</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.94rem', marginTop: '4px' }}>
              Simulate kitchen cooking scenarios in real time. Compare traditional blind guesswork against skip-adjusted headcount prediction.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={startSimulation}
              disabled={isSimulating}
              className="btn-primary"
              style={{ gap: '8px' }}
            >
              <Play size={16} fill="currentColor" /> {isSimulating ? 'Simulating Service...' : 'Simulate Lunch Service'}
            </button>
            <button
              onClick={() => {
                setTotalStudents(450);
                setSkipsCount(68);
                setBufferPercent(8);
                setDishRating(4.2);
                setSimProgress(0);
                setSimServed(0);
              }}
              className="btn-secondary"
              title="Reset parameters"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Live Simulation Progress Bar */}
        {isSimulating && (
          <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '14px', background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                12:30 PM — 02:30 PM Lunch Service in Progress... ({simProgress}%)
              </span>
              <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>
                {simServed} / {actualEaters} Diners Served
              </span>
            </div>
            <div style={{ height: '8px', width: '100%', borderRadius: '9999px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${simProgress}%`,
                  background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                  borderRadius: '9999px',
                  boxShadow: '0 0 12px var(--primary)',
                  transition: 'width 0.1s linear'
                }}
              />
            </div>
          </div>
        )}

        {/* Interactive Sliders Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '22px', marginBottom: '36px' }}>
          {/* Slider 1: Registered Diners */}
          <div className="mirror-subtle" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="card-label" style={{ marginBottom: 0 }}>Registered Diners</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--foreground)' }}>{totalStudents}</span>
            </div>
            <input
              type="range"
              min="100"
              max="1200"
              step="10"
              value={totalStudents}
              onChange={(e) => setTotalStudents(Number(e.target.value))}
              className="spatial-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--muted-foreground)', marginTop: '8px' }}>
              <span>100</span>
              <span>Hostel Capacity</span>
              <span>1200</span>
            </div>
          </div>

          {/* Slider 2: Skips Marked */}
          <div className="mirror-subtle" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="card-label" style={{ marginBottom: 0 }}>Skips Before Cut-off</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent)' }}>{skipsCount}</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.min(300, totalStudents - 50)}
              step="2"
              value={skipsCount}
              onChange={(e) => setSkipsCount(Number(e.target.value))}
              className="spatial-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--muted-foreground)', marginTop: '8px' }}>
              <span>0 skips</span>
              <span>{Math.round((skipsCount / totalStudents) * 100)}% opt-out</span>
              <span>{Math.min(300, totalStudents - 50)}</span>
            </div>
          </div>

          {/* Slider 3: Kitchen Buffer % */}
          <div className="mirror-subtle" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="card-label" style={{ marginBottom: 0 }}>Safety Buffer</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>+{bufferPercent}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              step="1"
              value={bufferPercent}
              onChange={(e) => setBufferPercent(Number(e.target.value))}
              className="spatial-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--muted-foreground)', marginTop: '8px' }}>
              <span>+2% (Tight)</span>
              <span>Portion Margin</span>
              <span>+25% (Loose)</span>
            </div>
          </div>

          {/* Slider 4: Recipe Rating */}
          <div className="mirror-subtle" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="card-label" style={{ marginBottom: 0 }}>Recipe Rating</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fbbf24' }}>{dishRating.toFixed(1)} ★</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={dishRating}
              onChange={(e) => setDishRating(Number(e.target.value))}
              className="spatial-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--muted-foreground)', marginTop: '8px' }}>
              <span>1.0 (Low)</span>
              <span>Student Appetite</span>
              <span>5.0 (High)</span>
            </div>
          </div>
        </div>

        {/* Live Impact Counters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '22px' }}>
          {/* Card 1: Daily Waste Cut */}
          <div
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(52, 211, 153, 0.04))',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              boxShadow: '0 10px 30px -10px rgba(52, 211, 153, 0.2)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '8px' }}>
              <Scale size={20} />
              <span className="card-label" style={{ marginBottom: 0, color: 'var(--primary)' }}>Daily Food Waste Cut</span>
            </div>
            <div className="card-stat-value" style={{ color: 'var(--foreground)' }}>
              <AnimatedCounter to={dailyKgSaved} suffix=" kg" decimals={1} />
            </div>
            <p className="card-subtext" style={{ color: 'var(--primary)', marginTop: 'auto', paddingTop: '6px' }}>
              ▼ Down from {blindWasteKg} kg blind waste to {messPulseWasteKg} kg
            </p>
          </div>

          {/* Card 2: Annual Cost Savings */}
          <div
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.04))',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              boxShadow: '0 10px 30px -10px rgba(251, 191, 36, 0.2)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent)', marginBottom: '8px' }}>
              <IndianRupee size={20} />
              <span className="card-label" style={{ marginBottom: 0, color: 'var(--accent)' }}>Annual Grocery Savings</span>
            </div>
            <div className="card-stat-value" style={{ color: 'var(--foreground)' }}>
              <AnimatedCounter to={annualMoneySaved} prefix="₹ " />
            </div>
            <p className="card-subtext" style={{ color: 'var(--accent)', marginTop: 'auto', paddingTop: '6px' }}>
              ₹ {dailyMoneySaved.toLocaleString()} saved every day across all meals
            </p>
          </div>

          {/* Card 3: Portions Cooked Accuracy */}
          <div
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted-foreground)', marginBottom: '8px' }}>
              <Users size={20} />
              <span className="card-label" style={{ marginBottom: 0 }}>Portions Cooked</span>
            </div>
            <div className="card-stat-value" style={{ color: 'var(--foreground)' }}>
              <AnimatedCounter to={cookingPortions} suffix=" portions" />
            </div>
            <p className="card-subtext" style={{ marginTop: 'auto', paddingTop: '6px' }}>
              Vs {blindCookingPortions} portions without skip prediction
            </p>
          </div>

          {/* Card 4: Environmental Impact */}
          <div
            style={{
              padding: '24px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.12), rgba(74, 222, 128, 0.03))',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4ade80', marginBottom: '8px' }}>
              <Leaf size={20} />
              <span className="card-label" style={{ marginBottom: 0, color: '#4ade80' }}>CO₂ Emissions Offset</span>
            </div>
            <div className="card-stat-value" style={{ color: 'var(--foreground)' }}>
              <AnimatedCounter to={co2KgSaved} suffix=" kg" />
            </div>
            <p className="card-subtext" style={{ color: '#4ade80', marginTop: 'auto', paddingTop: '6px' }}>
              Equal to planting ~{Math.round(co2KgSaved / 22)} urban trees / year
            </p>
          </div>
        </div>
      </SpatialCard>
    </div>
  );
};
