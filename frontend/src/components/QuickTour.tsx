import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Compass, ArrowRight, ArrowLeft, CheckCircle2, 
  X, Lock, ShieldCheck, Utensils, Award
} from 'lucide-react';

interface QuickTourProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  title: string;
  role: string;
  content: string;
  highlight?: string;
  interactiveDemo?: 'rate' | 'skip' | 'action';
}

const TOUR_CONTENT: Record<string, TourStep[]> = {
  student: [
    {
      title: 'Welcome to MessPulse',
      role: 'Student',
      content: 'MessPulse gives you a fast, direct voice in your hostel mess. Rate meals in 5 seconds and mark skipped meals in advance so the kitchen avoids cooking surplus food.'
    },
    {
      title: "Today's Live Menu Card",
      role: 'Student',
      content: 'View what is being served for Breakfast, Lunch, Snacks, and Dinner with green and red dietary markers. Everything is updated live by the mess committee.'
    },
    {
      title: '5-Second Anonymous Rating',
      role: 'Student',
      content: 'Tap a score from 1 to 5 stars, select reason tags like "Great Taste" or "Too Salty", and leave quick comments. Try tapping the demo stars below!',
      interactiveDemo: 'rate'
    },
    {
      title: 'Skip-a-Meal & Clear Cut-off',
      role: 'Student',
      content: 'Eating outside or heading home? Tap "Skip Meal" before the displayed cut-off time. This tells cooks exactly how many portions to prepare, saving food and money.',
      interactiveDemo: 'skip'
    },
    {
      title: 'You Said, We Did & Waste Meter',
      role: 'Student',
      content: 'See the impact of student ratings! The public "You Said, We Did" log displays recipe and service changes made by the warden based directly on student feedback.'
    },
    {
      title: 'Privacy Guaranteed',
      role: 'Student',
      content: 'Your identity is strictly anonymous. Mess staff and wardens never see individual student ratings. Ratings only appear in aggregate once at least 5 students have rated.'
    }
  ],
  staff: [
    {
      title: 'Welcome to Mess Staff Portal',
      role: 'Mess Staff',
      content: 'Cook against clear numbers instead of guessing. You will enter just three figures daily: meal served count, leftover kg per dish, and menu updates.'
    },
    {
      title: 'Daily Leftover & Headcount Entry',
      role: 'Mess Staff',
      content: 'Weigh food left in serving trays after each meal and enter the kilogram amounts on one simple phone-friendly screen. Takes under 60 seconds.'
    },
    {
      title: 'Transparent Expected Headcount',
      role: 'Mess Staff',
      content: 'See how many students are expected for upcoming meals. Calculated from hostel capacity minus on-time skips, adjusted for the day of the week.'
    },
    {
      title: 'Menu Editor',
      role: 'Mess Staff',
      content: 'Keep the hostel informed. Quickly assign dishes from the kitchen catalogue or create new specials for upcoming festivals and weekends.'
    },
    {
      title: 'Support & Guidance',
      role: 'Mess Staff',
      content: 'Need help? The in-app Help Centre includes step-by-step guides for kitchen weighing and correcting entered values.'
    }
  ],
  warden: [
    {
      title: 'Warden & Administrator Dashboard',
      role: 'Warden',
      content: 'Evidence-based decisions and vendor oversight. Track waste-per-head metrics, food costs, and student satisfaction in real time.'
    },
    {
      title: 'Waste Dashboard & Per-Head Metrics',
      role: 'Warden',
      content: 'Compare busy weekdays and quiet weekends fairly using Leftover kg divided by headcount served. Instantly identify top-wasted recipes.'
    },
    {
      title: 'Ratings Dashboard & Privacy Gate',
      role: 'Warden',
      content: 'Review dish ratings and taste complaint trends. Scores remain masked until at least 5 students vote to preserve genuine student trust.'
    },
    {
      title: 'Publish to "You Said, We Did"',
      role: 'Warden',
      content: 'Close the feedback loop. When you resolve an issue (e.g. reduced salt, fresher rotis), publish an action so students see their voice produces change.'
    },
    {
      title: 'Ready to Lead Your Mess',
      role: 'Warden',
      content: 'You can replay this tour anytime from the Help menu or export weekly summaries directly to stakeholders.'
    }
  ]
};

export const QuickTour: React.FC<QuickTourProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const roleKey = user?.role === 'staff' ? 'staff' : (user?.role === 'warden' || user?.role === 'admin' ? 'warden' : 'student');
  const steps = TOUR_CONTENT[roleKey] || TOUR_CONTENT.student;

  const [currentStep, setCurrentStep] = useState(0);
  const [practiceRating, setPracticeRating] = useState(5);
  const [practiceSkipped, setPracticeSkipped] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const stepData = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = async () => {
    if (isLast) {
      if (user) {
        try {
          await api.updateTourProgress(user.role, steps.length, true);
        } catch {
          // ignore
        }
      }
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipTour = async () => {
    if (user) {
      try {
        await api.updateTourProgress(user.role, currentStep + 1, true);
      } catch {
        // ignore
      }
    }
    onClose();
  };

  const tourNode = (
    <div className="tour-spotlight-overlay" onClick={handleSkipTour} role="dialog" aria-modal="true">
      <div
        className="tour-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: 440
        }}
      >
        {/* Progress Bar & Header */}
        <div style={{ marginBottom: 14 }}>
          <div className="flex-between" style={{ marginBottom: 8 }}>
            <span style={{
              background: 'var(--olive-100)',
              color: 'var(--olive-800)',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--olive-200)',
              textTransform: 'uppercase'
            }}>
              Step {currentStep + 1} of {steps.length} • {stepData.role} Tour
            </span>
            <button
              onClick={handleSkipTour}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              title="Close Tour"
            >
              <X size={18} />
            </button>
          </div>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', gap: 6, height: 4 }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: 2,
                  background: i <= currentStep ? 'var(--olive-600)' : 'rgba(46, 83, 60, 0.15)',
                  boxShadow: i <= currentStep ? '0 0 6px rgba(79, 137, 101, 0.4)' : 'none',
                  transition: 'background 0.2s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <h3 style={{ fontSize: '1.25rem', color: 'var(--olive-900)', marginBottom: 8 }}>
          {stepData.title}
        </h3>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
          {stepData.content}
        </p>

        {/* Interactive Practice Sandbox */}
        {stepData.interactiveDemo === 'rate' && (
          <div style={{
            background: 'var(--card-bg)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            marginBottom: 16,
            boxShadow: 'inset 2px 2px 5px var(--card-shadow), inset -2px -2px 5px var(--card-highlight)'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--olive-800)', marginBottom: 4 }}>
              Try Rating This Practice Meal:
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPracticeRating(s)}
                  className="rating-star-btn"
                  style={{
                    fontSize: '1.6rem',
                    color: s <= practiceRating ? 'var(--olive-600)' : '#BAC4B5'
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Practice rating: {practiceRating}/5 (Not saved to real data)
            </div>
          </div>
        )}

        {stepData.interactiveDemo === 'skip' && (
          <div style={{
            background: 'var(--card-bg)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            marginBottom: 16,
            boxShadow: 'inset 2px 2px 5px var(--card-shadow), inset -2px -2px 5px var(--card-highlight)'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--olive-800)', marginBottom: 8 }}>
              Practice Skip Button:
            </div>
            <button
              type="button"
              onClick={() => setPracticeSkipped(!practiceSkipped)}
              className={`skeuo-btn ${practiceSkipped ? 'skeuo-btn-secondary' : 'spatial-btn-primary'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              {practiceSkipped ? 'Undo Skip (Practice)' : 'Skip Tomorrow Dinner (Practice)'}
            </button>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
              {practiceSkipped ? '✓ Marked as skipped before cut-off' : 'Cut-off time: 6:30 PM (60 mins before service)'}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex-between" style={{ marginTop: 8 }}>
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="skeuo-btn skeuo-btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem', opacity: currentStep === 0 ? 0.3 : 1 }}
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="skeuo-btn spatial-btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <span>{isLast ? 'Complete Tour' : 'Next'}</span>
            {isLast ? <CheckCircle2 size={15} /> : <ArrowRight size={15} />}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(tourNode, document.body);
};
