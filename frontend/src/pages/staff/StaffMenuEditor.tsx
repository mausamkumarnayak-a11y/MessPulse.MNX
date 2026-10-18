import React, { useState, useEffect } from 'react';
import { MealSlot, Dish, MealType } from '../../types';
import { api } from '../../services/api';
import { Utensils, Plus, Trash2, Save, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export const StaffMenuEditor: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [slotDishesMap, setSlotDishesMap] = useState<Record<string, string[]>>({});
  
  // New dish modal/form state
  const [showNewDish, setShowNewDish] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishVeg, setNewDishVeg] = useState(true);
  const [newDishCategory, setNewDishCategory] = useState('Main');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async (dateStr: string) => {
    try {
      const [dishesData, slotsData] = await Promise.all([
        api.getDishes(),
        api.getSlotsByDate(dateStr)
      ]);
      setDishes(dishesData);
      setSlots(slotsData);

      const map: Record<string, string[]> = {};
      slotsData.forEach((s) => {
        map[s.meal_type] = s.dishes.map((d) => d.id);
      });
      setSlotDishesMap(map);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const handleAddDishToSlot = (mtype: string, dishId: string) => {
    if (!dishId) return;
    setSlotDishesMap((prev) => {
      const current = prev[mtype] || [];
      if (current.includes(dishId)) return prev;
      return { ...prev, [mtype]: [...current, dishId] };
    });
  };

  const handleRemoveDishFromSlot = (mtype: string, dishId: string) => {
    setSlotDishesMap((prev) => {
      const current = prev[mtype] || [];
      return { ...prev, [mtype]: current.filter((id) => id !== dishId) };
    });
  };

  const handleSaveMenu = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload = (['breakfast', 'lunch', 'snacks', 'dinner'] as MealType[]).map((mtype) => {
        const slot = slots.find((s) => s.meal_type === mtype);
        return {
          meal_type: mtype,
          start_time: slot ? slot.start_time : (mtype === 'breakfast' ? '07:30' : mtype === 'lunch' ? '12:30' : mtype === 'snacks' ? '17:00' : '19:30'),
          end_time: slot ? slot.end_time : (mtype === 'breakfast' ? '09:30' : mtype === 'lunch' ? '14:30' : mtype === 'snacks' ? '18:00' : '21:30'),
          dish_ids: slotDishesMap[mtype] || []
        };
      });

      await api.updateMenuForDate(selectedDate, payload);
      setSuccessMsg(`Menu successfully saved for ${selectedDate}!`);
      setTimeout(() => setSuccessMsg(null), 3500);
      loadData(selectedDate);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save menu');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) return;
    try {
      const created = await api.createDish({
        name: newDishName.trim(),
        veg_flag: newDishVeg,
        category: newDishCategory
      });
      setDishes((prev) => [...prev, created]);
      setNewDishName('');
      setShowNewDish(false);
      setSuccessMsg(`Added "${created.name}" to dish catalogue.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Could not create dish');
    }
  };

  return (
    <div className="app-container">
      <div className="flex-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber-600)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
            <Utensils size={14} />
            <span>Kitchen Management</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--olive-900)' }}>Weekly Menu Editor</h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowNewDish(true)}
            className="skeuo-btn skeuo-btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Plus size={15} />
            <span>New Recipe</span>
          </button>
          <button
            onClick={handleSaveMenu}
            disabled={saving}
            className="skeuo-btn skeuo-btn-amber"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Publish Menu'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{
          background: '#E8F5E9',
          color: 'var(--veg-green)',
          border: '1px solid #A5D6A7',
          padding: '10px 14px',
          borderRadius: 10,
          fontWeight: 600,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: '#FEE2E2',
          color: '#B91C1C',
          padding: '10px 14px',
          borderRadius: 10,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Date Picker Bar */}
      <div className="neumo-card" style={{ padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Calendar size={18} color="var(--olive-700)" />
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--olive-900)' }}>Select Date:</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="neumo-input"
          style={{ width: 'auto', fontWeight: 600 }}
        />
      </div>

      {/* Slots & Dish Assignment */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {(['breakfast', 'lunch', 'snacks', 'dinner'] as MealType[]).map((mtype) => {
          const assignedIds = slotDishesMap[mtype] || [];
          const assignedDishes = dishes.filter((d) => assignedIds.includes(d.id));

          return (
            <div key={mtype} className="neumo-card" style={{ padding: 20 }}>
              <div className="flex-between" style={{ marginBottom: 12 }}>
                <h3 style={{ textTransform: 'capitalize', fontSize: '1.2rem', color: 'var(--olive-900)' }}>
                  {mtype}
                </h3>

                {/* Add dish dropdown */}
                <select
                  onChange={(e) => {
                    handleAddDishToSlot(mtype, e.target.value);
                    e.target.value = '';
                  }}
                  className="neumo-input"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
                  defaultValue=""
                >
                  <option value="" disabled>+ Add Dish from Catalogue</option>
                  {dishes
                    .filter((d) => !assignedIds.includes(d.id))
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.veg_flag ? 'Veg' : 'Non-Veg'})
                      </option>
                    ))}
                </select>
              </div>

              {assignedDishes.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: 8 }}>
                  No dishes scheduled yet. Use the dropdown above to add items.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {assignedDishes.map((dish) => (
                    <span
                      key={dish.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: '#FFFFFF',
                        border: '1px solid rgba(45, 74, 62, 0.15)',
                        borderRadius: 10,
                        padding: '6px 10px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      <span className={dish.veg_flag ? 'badge-veg' : 'badge-nonveg'}>
                        {dish.veg_flag ? 'Veg' : 'Non-Veg'}
                      </span>
                      <span>{dish.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDishFromSlot(mtype, dish.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 2 }}
                        title="Remove dish"
                      >
                        <Trash2 size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Dish Modal */}
      {showNewDish && (
        <div className="glass-modal-backdrop" onClick={() => setShowNewDish(false)}>
          <div className="glass-modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--olive-900)', marginBottom: 14 }}>
              Add Dish to Kitchen Catalogue
            </h3>
            <form onSubmit={handleCreateNewDish}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Dish Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kashmiri Dum Aloo"
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  className="neumo-input"
                  required
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Dietary Classification
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="radio"
                      checked={newDishVeg}
                      onChange={() => setNewDishVeg(true)}
                    />
                    <span>🌱 Vegetarian</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="radio"
                      checked={!newDishVeg}
                      onChange={() => setNewDishVeg(false)}
                    />
                    <span>🍗 Non-Vegetarian</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Category
                </label>
                <select
                  value={newDishCategory}
                  onChange={(e) => setNewDishCategory(e.target.value)}
                  className="neumo-input"
                >
                  <option value="Main">Main Course</option>
                  <option value="Side">Side Dish</option>
                  <option value="Bread">Bread / Roti</option>
                  <option value="Breakfast">Breakfast Special</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowNewDish(false)}
                  className="skeuo-btn skeuo-btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="skeuo-btn skeuo-btn-amber"
                  style={{ flex: 1 }}
                >
                  Add Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
