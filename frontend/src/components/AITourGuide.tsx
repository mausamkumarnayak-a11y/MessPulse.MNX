import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X } from 'lucide-react';

export interface TourStep {
  id: string | null;
  tab?: 'overview' | 'student' | 'staff' | 'warden' | 'simulation' | 'settings';
  title: string;
  text: string;
  tip?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: null,
    tab: 'overview',
    title: "Namaste! I'm Pulse 👋",
    text: "I'll guide you through MessPulse Dark — the floating spatial web app designed to eliminate hostel food waste. Ready to explore?",
    tip: "You can click me anytime in the corner to re-open the tour."
  },
  {
    id: "tour-rating",
    tab: 'student',
    title: "Today's Menu & 5-Second Rating",
    text: "Tap a face emoji to rate the meal in 5 seconds. Anonymous feedback prevents bias and lets the kitchen know what works.",
    tip: "Ratings stay masked until 5 students submit to protect privacy!"
  },
  {
    id: "tour-skip",
    tab: 'student',
    title: "Skip-a-Meal with Cut-off Protection",
    text: "Not eating? Mark skip before the morning cut-off. Headcount adjusts in real time so cooks don't prepare surplus food.",
    tip: "You can also undo a skip if your plans change before the cut-off."
  },
  {
    id: "tour-simulator",
    tab: 'simulation',
    title: "Live Food Waste & Cost Simulator",
    text: "Drag the sliders to simulate student attendance, skips, and kitchen batch prep. Watch leftover kg and cost savings update live!",
    tip: "Try tweaking the show-up rate to see how prediction prevents waste."
  },
  {
    id: "tour-staff",
    tab: 'staff',
    title: "Kitchen Staff Daily Entry",
    text: "One simple screen for cooks: enter diners served and weighed leftover kg per dish. No tedious forms.",
    tip: "Automatically computes leftover grams per student."
  },
  {
    id: "tour-warden",
    tab: 'warden',
    title: "Warden Analytics & 'You Said, We Did'",
    text: "Wardens track dish-level waste trends and log corrective actions in the public action tracker, closing the loop every week.",
    tip: "Transparent accountability turns feedback into real recipe changes."
  },
  {
    id: "tour-settings",
    tab: 'settings',
    title: "Configurable Campus & Menu Settings",
    text: "Customize university name, kitchen name ('Kaivalya'), resident student profile, staff leadership, and manage all daily recipes in the Menu Editor.",
    tip: "All edits persist and update the app immediately across every view!"
  },
  {
    id: "tour-roles",
    tab: 'overview',
    title: "Three Roles, One Spatial Pulse",
    text: "Students, mess staff, and wardens each have dedicated spatial dashboards. That's the tour — feel free to explore!",
    tip: "Click on any role above or use the simulator to test real workflows."
  }
];

interface AITourGuideProps {
  currentTab: string;
  onSelectTab: (tab: 'overview' | 'student' | 'staff' | 'warden' | 'simulation' | 'settings') => void;
}

export const AITourGuide: React.FC<AITourGuideProps> = ({ currentTab, onSelectTab }) => {
  const [stepIndex, setStepIndex] = useState<number>(-1);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Auto-prompt tour on first visit after 1.5 seconds
  useEffect(() => {
    const isCompleted = localStorage.getItem('messpulse_dark_tour_done');
    if (!isCompleted && !hasAutoOpened) {
      const timer = setTimeout(() => {
        setStepIndex(0);
        setHasAutoOpened(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasAutoOpened]);

  // Handle active spotlight focus whenever step changes
  useEffect(() => {
    // Remove previous spotlight
    document.querySelectorAll('.tour-focus').forEach((el) => {
      el.classList.remove('tour-focus');
    });

    if (stepIndex < 0 || stepIndex >= TOUR_STEPS.length) return;

    const currentStep = TOUR_STEPS[stepIndex];

    // If step requires switching tabs, switch it
    if (currentStep.tab && currentStep.tab !== currentTab) {
      onSelectTab(currentStep.tab);
    }

    if (!currentStep.id) return;

    const highlightTarget = () => {
      const el = document.getElementById(currentStep.id!);
      if (!el) return false;

      el.classList.add('tour-focus');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    };

    // Retry briefly if element is mounting in the DOM
    const timer = setTimeout(() => {
      highlightTarget();
    }, 150);

    return () => {
      clearTimeout(timer);
      document.querySelectorAll('.tour-focus').forEach((el) => {
        el.classList.remove('tour-focus');
      });
    };
  }, [stepIndex, currentTab, onSelectTab]);

  const handleNext = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleFinish = () => {
    setStepIndex(-1);
    localStorage.setItem('messpulse_dark_tour_done', 'true');
    document.querySelectorAll('.tour-focus').forEach((el) => {
      el.classList.remove('tour-focus');
    });
  };

  const currentStep = stepIndex >= 0 ? TOUR_STEPS[stepIndex] : null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        gap: '16px',
        maxWidth: 'calc(100vw - 32px)'
      }}
    >
      {/* Tour Dialog Card */}
      {currentStep && (
        <div
          role="dialog"
          aria-label="Pulse AI tour guide"
          className="mirror sheen animate-fade-in"
          style={{
            width: '320px',
            maxWidth: 'calc(100vw - 110px)',
            padding: '20px',
            borderRadius: '20px',
            backgroundColor: 'rgba(16, 23, 34, 0.88)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.7), 0 0 30px rgba(52, 211, 153, 0.15)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'var(--primary)',
                background: 'rgba(52, 211, 153, 0.12)',
                padding: '3px 8px',
                borderRadius: '9999px',
                border: '1px solid rgba(52, 211, 153, 0.25)'
              }}
            >
              Step {stepIndex + 1} / {TOUR_STEPS.length}
            </span>
            <button
              onClick={handleFinish}
              style={{
                color: 'var(--muted-foreground)',
                padding: '4px',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center'
              }}
              title="Close tour"
            >
              <X size={16} />
            </button>
          </div>

          {/* Title & Body */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--foreground)', marginBottom: '8px' }}>
            {currentStep.title}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted-foreground)', lineHeight: 1.5, marginBottom: '10px' }}>
            {currentStep.text}
          </p>

          {currentStep.tip && (
            <div
              style={{
                fontSize: '0.76rem',
                color: 'var(--primary)',
                background: 'rgba(52, 211, 153, 0.08)',
                padding: '6px 10px',
                borderRadius: '8px',
                borderLeft: '2px solid var(--primary)',
                marginBottom: '16px'
              }}
            >
              💡 {currentStep.tip}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={handleFinish}
              style={{
                fontSize: '0.8rem',
                color: 'var(--muted-foreground)',
                textDecoration: 'underline'
              }}
            >
              Skip tour
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              {stepIndex > 0 && (
                <button
                  onClick={handleBack}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                {stepIndex === TOUR_STEPS.length - 1 ? (
                  <>Finish <Sparkles size={14} /></>
                ) : (
                  <>Next <ArrowRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Robot Avatar Toggle Button */}
      <button
        onClick={() => setStepIndex(stepIndex >= 0 ? -1 : 0)}
        aria-label="Open AI guide tour"
        className="robot-bob"
        style={{
          position: 'relative',
          width: '68px',
          height: '68px',
          flexShrink: 0,
          background: 'none',
          padding: 0,
          cursor: 'pointer'
        }}
      >
        {/* Glow halo */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'var(--primary)',
            filter: 'blur(20px)',
            opacity: 0.35
          }}
        />

        {/* Outer Mirror sphere */}
        <span
          className="mirror"
          style={{
            position: 'absolute',
            inset: '3px',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            border: '1.5px solid rgba(52, 211, 153, 0.4)',
            boxShadow: '0 0 20px rgba(52, 211, 153, 0.25), inset 0 2px 4px rgba(255,255,255,0.4)'
          }}
        >
          {/* Robot Eyes with Blink */}
          <span
            className="robot-blink"
            style={{
              display: 'flex',
              gap: '6px'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '11px',
                borderRadius: '9999px',
                backgroundColor: 'var(--primary)',
                boxShadow: '0 0 8px var(--primary)'
              }}
            />
            <span
              style={{
                width: '8px',
                height: '11px',
                borderRadius: '9999px',
                backgroundColor: 'var(--primary)',
                boxShadow: '0 0 8px var(--primary)'
              }}
            />
          </span>

          {/* Robot Smile Mouth */}
          <span
            style={{
              position: 'absolute',
              bottom: '16px',
              width: '18px',
              height: '5px',
              borderBottomLeftRadius: '9999px',
              borderBottomRightRadius: '9999px',
              backgroundColor: 'var(--accent)',
              boxShadow: '0 0 8px var(--accent)'
            }}
          />
        </span>

        {/* Antenna Stem & Glowing Orb */}
        <span
          style={{
            position: 'absolute',
            top: '-7px',
            left: '50%',
            width: '2px',
            height: '12px',
            transform: 'translateX(-50%)',
            background: 'var(--glass-edge)'
          }}
        />
        <span
          style={{
            position: 'absolute',
            top: '-11px',
            left: '50%',
            width: '9px',
            height: '9px',
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            boxShadow: '0 0 14px var(--accent)'
          }}
        />
      </button>
    </div>
  );
};
