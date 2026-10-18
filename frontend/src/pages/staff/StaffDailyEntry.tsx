import React, { useState, useEffect } from 'react';
import { MealSlot, WasteEntry } from '../../types';
import { api } from '../../services/api';
import { 
  ClipboardEdit, Scale, Users, Save, CheckCircle2, 
  AlertCircle, RotateCcw, Utensils 
} from 'lucide-react';

export const StaffDailyEntry: React.FC = () => {
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [headcount, setHeadcount] = useState<string>('');
  const [wasteEntries, setWasteEntries] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getTodaySlots();
      setSlots(data);
      if (data.length > 0 && !selectedSlotId) {
        setSelectedSlotId(data[0].id);
        if (data[0].headcount_served) {
          setHeadcount(String(data[0].headcount_served));
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch meal slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeSlot = slots.find((s) => s.id === selectedSlotId);

  // Update headcount prefill when slot changes
  useEffect(() => {
    if (activeSlot && activeSlot.headcount_served) {
      setHeadcount(String(activeSlot.headcount_served));
    }
  }, [selectedSlotId]);

  const handleWasteChange = (dishId: string, val: string) => {
    setWasteEntries((prev) => ({ ...prev, [dishId]: val }));
  };

  const handleNotesChange = (dishId: string, val: string) => {
    setNotes((prev) => ({ ...prev, [dishId]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlot) return;

    const parsedHeadcount = parseInt(headcount, 10);
    if (isNaN(parsedHeadcount) || parsedHeadcount < 0) {
      setErrorMsg('Please enter a valid served student headcount (0 or greater).');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Log Headcount
      await api.logHeadcount(activeSlot.id, parsedHeadcount);

      // 2. Prepare leftover entries
      const entries: WasteEntry[] = activeSlot.dishes.map((d) => ({
        dish_id: d.id,
        leftover_kg: parseFloat(wasteEntries[d.id] || '0.0') || 0.0,
        notes: notes[d.id] || ''
      }));

      await api.logWasteBatch(activeSlot.id, entries);

      setSuccessMsg(`Successfully saved headcount (${parsedHeadcount}) and leftover weights for ${activeSlot.meal_type}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save entries');
    } finally {
      setSaving(false);
    }
  };

  const totalLeftoverEntered = Object.values(wasteEntries).reduce(
    (sum, val) => sum + (parseFloat(val) || 0), 0
  );

  return (
    <div className="app-container">
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber-600)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
          <ClipboardEdit size={14} />
          <span>Mess Kitchen Desk</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--olive-900)' }}>Daily Leftover & Headcount Entry</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          One screen for kitchen staff to record diners served and weighed food leftovers per dish.
        </p>
      </div>

      {successMsg && (
        <div style={{
          background: '#E8F5E9',
          color: 'var(--veg-green)',
          border: '1px solid #A5D6A7',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
          fontWeight: 700,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: '#FEE2E2',
          color: '#B91C1C',
          border: '1px solid #FECACA',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Select Meal Slot */}
      <div className="neumo-card" style={{ padding: 18, marginBottom: 18 }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--olive-900)', display: 'block', marginBottom: 10 }}>
          1. Choose Meal Service:
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {slots.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSlotId(s.id)}
              className={`skeuo-btn ${selectedSlotId === s.id ? 'skeuo-btn-amber' : 'skeuo-btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              <span style={{ textTransform: 'capitalize' }}>{s.meal_type}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>({s.start_time})</span>
            </button>
          ))}
        </div>
      </div>

      {activeSlot && (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Headcount Input */}
          <div className="neumo-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Users size={18} color="var(--olive-700)" />
              <label style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--olive-900)' }}>
                2. Total Students Served (Headcount)
              </label>
            </div>
            <input
              type="number"
              min="0"
              placeholder="e.g. 345"
              value={headcount}
              onChange={(e) => setHeadcount(e.target.value)}
              className="neumo-input"
              style={{ fontSize: '1.2rem', fontWeight: 700, maxWidth: 220 }}
              required
            />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
              Counted via dining entrance counter or coupon receipts.
            </div>
          </div>

          {/* Weighed Leftovers per Dish */}
          <div className="neumo-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Scale size={18} color="var(--olive-700)" />
                <h3 style={{ fontSize: '1rem', color: 'var(--olive-900)' }}>
                  3. Weighed Leftover Food (Kilograms)
                </h3>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--amber-600)' }}>
                Total: {totalLeftoverEntered.toFixed(2)} kg
              </span>
            </div>

            {activeSlot.dishes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No dishes assigned to this slot. Use the Menu Editor to add dishes.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {activeSlot.dishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="neumo-inset"
                    style={{
                      padding: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className={dish.veg_flag ? 'badge-veg' : 'badge-nonveg'}>
                          {dish.veg_flag ? 'Veg' : 'Non-Veg'}
                        </span>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--olive-900)' }}>{dish.name}</strong>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Category: {dish.category || 'Main'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ position: 'relative', width: 110 }}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="0.0"
                          value={wasteEntries[dish.id] || ''}
                          onChange={(e) => handleWasteChange(dish.id, e.target.value)}
                          className="neumo-input"
                          style={{ paddingRight: 32, textAlign: 'right', fontWeight: 700 }}
                        />
                        <span style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          pointerEvents: 'none'
                        }}>
                          kg
                        </span>
                      </div>

                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={notes[dish.id] || ''}
                        onChange={(e) => handleNotesChange(dish.id, e.target.value)}
                        className="neumo-input"
                        style={{ maxWidth: 180, fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || activeSlot.dishes.length === 0}
            className="skeuo-btn skeuo-btn-amber"
            style={{ padding: '14px', fontSize: '1rem', width: '100%' }}
          >
            <Save size={18} />
            <span>{saving ? 'Saving Entries...' : 'Save Daily Kitchen Entry'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
