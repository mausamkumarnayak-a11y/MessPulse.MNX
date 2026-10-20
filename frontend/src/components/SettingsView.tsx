import React, { useState } from 'react';
import { useApp, type DishItem } from '../context/AppContext';
import { SpatialCard } from './SpatialCard';
import { 
  Building2, UtensilsCrossed, UserCheck, Shield, GraduationCap, 
  ChefHat, Save, Plus, Trash2, Edit2, RotateCcw, Sparkles 
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    organizationName, setOrganizationName,
    kitchenName, setKitchenName,
    studentName, setStudentName,
    staffName, setStaffName,
    wardenName, setWardenName,
    adminName, setAdminName,
    slots,
    addDishToSlot,
    editDishInSlot,
    deleteDishFromSlot,
    resetDefaultMenu
  } = useApp();

  const [activeTab, setActiveTab] = useState<'campus' | 'people' | 'menu'>('campus');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-lunch');
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // New Dish Modal / Form State
  const [showAddDish, setShowAddDish] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('Curry');
  const [newDishIsVeg, setNewDishIsVeg] = useState(true);

  // Edit Dish State
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [editDishName, setEditDishName] = useState('');
  const [editDishCategory, setEditDishCategory] = useState('');
  const [editDishIsVeg, setEditDishIsVeg] = useState(true);

  const activeSlot = slots.find((s) => s.id === selectedSlotId) || slots[0];

  const triggerSavedToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 3500);
  };

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) return;

    addDishToSlot(selectedSlotId, {
      name: newDishName.trim(),
      category: newDishCategory,
      is_veg: newDishIsVeg,
      cooked_kg: 30,
      leftover_kg: 1.5
    });

    setNewDishName('');
    setShowAddDish(false);
    triggerSavedToast(`Added "${newDishName}" to ${activeSlot.meal_type.toUpperCase()} menu!`);
  };

  const handleStartEditDish = (dish: DishItem) => {
    setEditingDishId(dish.id);
    setEditDishName(dish.name);
    setEditDishCategory(dish.category);
    setEditDishIsVeg(dish.is_veg);
  };

  const handleSaveEditDish = (dishId: string) => {
    if (!editDishName.trim()) return;
    editDishInSlot(selectedSlotId, dishId, {
      name: editDishName.trim(),
      category: editDishCategory,
      is_veg: editDishIsVeg
    });
    setEditingDishId(null);
    triggerSavedToast(`Updated recipe details!`);
  };

  return (
    <div id="tour-settings" style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Settings Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--primary)', fontWeight: 700 }}>
            System Configuration
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Campus, Profile & Menu Settings</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.92rem', marginTop: '4px' }}>
            Customize your university name, kitchen branding, student/staff personas, and daily menu recipes.
          </p>
        </div>

        {/* Setting Tabs */}
        <div className="mirror" style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '9999px' }}>
          <button
            onClick={() => setActiveTab('campus')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: activeTab === 'campus' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              backgroundColor: activeTab === 'campus' ? 'var(--primary)' : 'transparent',
              boxShadow: activeTab === 'campus' ? '0 0 20px var(--primary)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Campus & Mess
          </button>
          <button
            onClick={() => setActiveTab('people')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: activeTab === 'people' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              backgroundColor: activeTab === 'people' ? 'var(--primary)' : 'transparent',
              boxShadow: activeTab === 'people' ? '0 0 20px var(--primary)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Personas & Staff
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: activeTab === 'menu' ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
              backgroundColor: activeTab === 'menu' ? 'var(--primary)' : 'transparent',
              boxShadow: activeTab === 'menu' ? '0 0 20px var(--primary)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Menu Editor
          </button>
        </div>
      </div>

      {/* Toast Banner */}
      {savedToast && (
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
          <Sparkles size={18} />
          <span>{savedToast}</span>
        </div>
      )}

      {/* Tab 1: Campus & Organization Profile */}
      {activeTab === 'campus' && (
        <SpatialCard className="p-8" float="none">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Building2 size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Campus & Mess Organization</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Organization Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '8px' }}>
                Hosting Organization / University Name
              </label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => {
                  setOrganizationName(e.target.value);
                  triggerSavedToast('Organization name updated live!');
                }}
                placeholder="e.g. Sri Sri University, Cuttack"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: 'var(--foreground)',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--primary)', marginTop: '4px', display: 'block' }}>
                Default: "Sri Sri University, Cuttack"
              </span>
            </div>

            {/* Kitchen Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '8px' }}>
                Mess / Kitchen Facility Name
              </label>
              <input
                type="text"
                value={kitchenName}
                onChange={(e) => {
                  setKitchenName(e.target.value);
                  triggerSavedToast('Kitchen facility name updated live!');
                }}
                placeholder="e.g. Kaivalya"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: 'var(--foreground)',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--primary)', marginTop: '4px', display: 'block' }}>
                Default: "Kaivalya"
              </span>
            </div>
          </div>

          {/* Live Preview Card */}
          <div style={{ marginTop: '28px', padding: '18px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.1em' }}>
              Live Header Brand Preview:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #2D4A3E 0%, #1B3329 100%)',
                border: '1px solid #3E6353',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UtensilsCrossed size={20} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>MessPulse</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: 'rgba(52, 211, 153, 0.2)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>SPATIAL DARK</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
                  {kitchenName} Kitchen · {organizationName}
                </div>
              </div>
            </div>
          </div>
        </SpatialCard>
      )}

      {/* Tab 2: Personas & Names */}
      {activeTab === 'people' && (
        <SpatialCard className="p-8" float="none">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <UserCheck size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>User Profiles & Leadership Names</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Student Name */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '8px' }}>
                <GraduationCap size={16} /> Student Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  triggerSavedToast('Student name updated live!');
                }}
                placeholder="e.g. Mausam Kumar Nayak"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: 'var(--foreground)',
                  fontSize: '0.98rem',
                  fontWeight: 600
                }}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--primary)', marginTop: '4px', display: 'block' }}>
                Default: "Mausam Kumar Nayak"
              </span>
            </div>

            {/* Mess Staff Name */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '8px' }}>
                <ChefHat size={16} /> Kitchen Supervisor / Head Chef Name
              </label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => {
                  setStaffName(e.target.value);
                  triggerSavedToast('Staff supervisor name updated live!');
                }}
                placeholder="e.g. Ramesh Nayak (Kitchen Supervisor)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: 'var(--foreground)',
                  fontSize: '0.98rem',
                  fontWeight: 600
                }}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--primary)', marginTop: '4px', display: 'block' }}>
                Default: "Ramesh Nayak (Kitchen Supervisor)"
              </span>
            </div>

            {/* Mess Warden Name */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '8px' }}>
                <Shield size={16} /> Mess Warden Name
              </label>
              <input
                type="text"
                value={wardenName}
                onChange={(e) => {
                  setWardenName(e.target.value);
                  triggerSavedToast('Warden name updated live!');
                }}
                placeholder="e.g. Prof. S. Mohapatra (Hostel Warden)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: 'var(--foreground)',
                  fontSize: '0.98rem',
                  fontWeight: 600
                }}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--primary)', marginTop: '4px', display: 'block' }}>
                Default: "Prof. S. Mohapatra (Hostel Warden)"
              </span>
            </div>

            {/* Administrator Name */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '8px' }}>
                <Building2 size={16} /> Campus Administrator / Dean Name
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => {
                  setAdminName(e.target.value);
                  triggerSavedToast('Administrator name updated live!');
                }}
                placeholder="e.g. Dr. A. K. Sharma (Director of Affairs)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: 'var(--foreground)',
                  fontSize: '0.98rem',
                  fontWeight: 600
                }}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--primary)', marginTop: '4px', display: 'block' }}>
                Default: "Dr. A. K. Sharma (Director of Affairs)"
              </span>
            </div>
          </div>
        </SpatialCard>
      )}

      {/* Tab 3: Menu Management */}
      {activeTab === 'menu' && (
        <SpatialCard className="p-8" float="none">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Daily Meal Menu Editor</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.88rem' }}>
                Add dishes, edit names, toggle vegetarian tags, and set categories per meal service.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowAddDish(true)}
                className="btn-primary"
                style={{ gap: '6px', fontSize: '0.86rem', padding: '8px 16px' }}
              >
                <Plus size={16} /> Add Recipe
              </button>
              <button
                onClick={() => {
                  resetDefaultMenu();
                  triggerSavedToast('Menu reset to Kaivalya default spread!');
                }}
                className="btn-secondary"
                style={{ gap: '6px', fontSize: '0.86rem', padding: '8px 16px' }}
                title="Restore original menu"
              >
                <RotateCcw size={16} /> Reset Default
              </button>
            </div>
          </div>

          {/* Slot Selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {slots.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSlotId(s.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: selectedSlotId === s.id ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  background: selectedSlotId === s.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  border: selectedSlotId === s.id ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: selectedSlotId === s.id ? '0 0 16px var(--primary)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {s.meal_type.toUpperCase()} ({s.dishes.length} items)
              </button>
            ))}
          </div>

          {/* Dish List for Selected Slot */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeSlot.dishes.map((dish) => {
              const isEditing = editingDishId === dish.id;

              return (
                <div
                  key={dish.id}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  {isEditing ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', flex: 1 }}>
                      <input
                        type="text"
                        value={editDishName}
                        onChange={(e) => setEditDishName(e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid var(--primary)',
                          color: 'var(--foreground)',
                          fontWeight: 600,
                          fontSize: '0.94rem',
                          flex: 1
                        }}
                      />
                      <select
                        value={editDishCategory}
                        onChange={(e) => setEditDishCategory(e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: '#121824',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: 'var(--foreground)'
                        }}
                      >
                        <option value="Curry">Curry</option>
                        <option value="Dal">Dal</option>
                        <option value="Rice">Rice</option>
                        <option value="Bread">Bread</option>
                        <option value="Main">Main Course</option>
                        <option value="Salad">Salad</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Snack">Snack</option>
                        <option value="Beverage">Beverage</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setEditDishIsVeg(!editDishIsVeg)}
                        className={`tag-pill ${editDishIsVeg ? 'active' : ''}`}
                      >
                        {editDishIsVeg ? '🌱 Pure Veg' : '🍗 Non-Veg'}
                      </button>
                      <button
                        onClick={() => handleSaveEditDish(dish.id)}
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      >
                        <Save size={14} /> Save
                      </button>
                      <button
                        onClick={() => setEditingDishId(null)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: dish.is_veg ? '#22c55e' : '#ef4444',
                            boxShadow: `0 0 10px ${dish.is_veg ? '#22c55e' : '#ef4444'}`
                          }}
                          title={dish.is_veg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
                        />
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)' }}>
                            {dish.name}
                          </span>
                          <span style={{ marginLeft: '10px', fontSize: '0.74rem', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px', color: 'var(--muted-foreground)' }}>
                            {dish.category}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleStartEditDish(dish)}
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            color: 'var(--muted-foreground)',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'grid',
                            placeItems: 'center'
                          }}
                          title="Edit recipe"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            deleteDishFromSlot(selectedSlotId, dish.id);
                            triggerSavedToast(`Removed "${dish.name}" from menu`);
                          }}
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            color: '#f87171',
                            background: 'rgba(239, 68, 68, 0.1)',
                            display: 'grid',
                            placeItems: 'center'
                          }}
                          title="Delete recipe"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Dish Modal */}
          {showAddDish && (
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
                  maxWidth: '460px',
                  padding: '24px',
                  borderRadius: '20px',
                  background: 'rgba(16, 23, 34, 0.95)',
                  border: '1px solid rgba(52, 211, 153, 0.3)'
                }}
              >
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px' }}>
                  Add Dish to {activeSlot.meal_type.toUpperCase()}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--muted-foreground)', marginBottom: '18px' }}>
                  Provide recipe name, dietary type, and menu category.
                </p>

                <form onSubmit={handleCreateDish} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
                      Dish / Recipe Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Masala Dosa with Sambar"
                      value={newDishName}
                      onChange={(e) => setNewDishName(e.target.value)}
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(0,0,0,0.3)',
                        color: 'var(--foreground)',
                        fontSize: '0.94rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
                        Category
                      </label>
                      <select
                        value={newDishCategory}
                        onChange={(e) => setNewDishCategory(e.target.value)}
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
                        <option value="Curry">Curry</option>
                        <option value="Dal">Dal</option>
                        <option value="Rice">Rice</option>
                        <option value="Bread">Bread</option>
                        <option value="Main">Main Course</option>
                        <option value="Salad">Salad</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Snack">Snack</option>
                        <option value="Beverage">Beverage</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>
                        Dietary Type
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewDishIsVeg(!newDishIsVeg)}
                        className={`tag-pill ${newDishIsVeg ? 'active' : ''}`}
                        style={{ width: '100%', height: '42px', justifyContent: 'center' }}
                      >
                        {newDishIsVeg ? '🌱 Pure Vegetarian' : '🍗 Non-Vegetarian'}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setShowAddDish(false)} className="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Add to Menu
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </SpatialCard>
      )}
    </div>
  );
};
