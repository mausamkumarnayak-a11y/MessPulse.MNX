import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DishItem {
  id: string;
  name: string;
  category: string;
  is_veg: boolean;
  cooked_kg?: number;
  leftover_kg?: number;
}

export interface MealSlotConfig {
  id: string;
  meal_type: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  start_time: string;
  end_time: string;
  cutoff_time: string;
  cutoff_minutes: number;
  dishes: DishItem[];
}

export interface ActionItem {
  id: string;
  student_feedback: string;
  action_taken: string;
  status: 'resolved' | 'in_progress' | 'planned';
  date: string;
  impact_summary: string;
}

interface AppContextType {
  // Configurable Profiles
  organizationName: string;
  setOrganizationName: (name: string) => void;
  kitchenName: string;
  setKitchenName: (name: string) => void;
  studentName: string;
  setStudentName: (name: string) => void;
  staffName: string;
  setStaffName: (name: string) => void;
  wardenName: string;
  setWardenName: (name: string) => void;
  adminName: string;
  setAdminName: (name: string) => void;

  // Menu Management
  slots: MealSlotConfig[];
  addDishToSlot: (slotId: string, dish: Omit<DishItem, 'id'>) => void;
  editDishInSlot: (slotId: string, dishId: string, updated: Partial<DishItem>) => void;
  deleteDishFromSlot: (slotId: string, dishId: string) => void;
  resetDefaultMenu: () => void;

  // Student State (Independent per-slot skips!)
  skippedSlotIds: Record<string, boolean>;
  toggleSkipSlot: (slotId: string) => void;
  ratings: Record<string, { score: number; tags: string[] }>;
  submitRating: (slotId: string, score: number, tags: string[]) => void;

  // Actions
  actions: ActionItem[];
  addAction: (action: Omit<ActionItem, 'id' | 'date'>) => void;
  updateActionStatus: (id: string, status: 'resolved' | 'in_progress' | 'planned') => void;
}

const DEFAULT_SLOTS: MealSlotConfig[] = [
  {
    id: 'slot-breakfast',
    meal_type: 'breakfast',
    start_time: '07:30 AM',
    end_time: '09:30 AM',
    cutoff_time: '06:30 AM',
    cutoff_minutes: 60,
    dishes: [
      { id: 'b1', name: 'Indori Poha with Sev', category: 'Breakfast', is_veg: true, cooked_kg: 35, leftover_kg: 2.1 },
      { id: 'b2', name: 'Hot Sambar & Chutney', category: 'Accompaniment', is_veg: true, cooked_kg: 25, leftover_kg: 1.5 },
      { id: 'b3', name: 'Boiled Eggs / Sprouts', category: 'Protein', is_veg: false, cooked_kg: 20, leftover_kg: 0.8 },
      { id: 'b4', name: 'Special Ginger Masala Chai', category: 'Beverage', is_veg: true, cooked_kg: 30, leftover_kg: 1.2 }
    ]
  },
  {
    id: 'slot-lunch',
    meal_type: 'lunch',
    start_time: '12:30 PM',
    end_time: '02:30 PM',
    cutoff_time: '10:30 AM',
    cutoff_minutes: 120,
    dishes: [
      { id: 'l1', name: 'Paneer Butter Masala', category: 'Curry', is_veg: true, cooked_kg: 55, leftover_kg: 3.2 },
      { id: 'l2', name: 'Dal Tadka Special', category: 'Dal', is_veg: true, cooked_kg: 48, leftover_kg: 4.5 },
      { id: 'l3', name: 'Steamed Jeera Basmati Rice', category: 'Rice', is_veg: true, cooked_kg: 70, leftover_kg: 8.0 },
      { id: 'l4', name: 'Tandoori Butter Roti', category: 'Bread', is_veg: true, cooked_kg: 40, leftover_kg: 2.1 },
      { id: 'l5', name: 'Fresh Cucumber Tomato Salad', category: 'Salad', is_veg: true, cooked_kg: 20, leftover_kg: 1.0 }
    ]
  },
  {
    id: 'slot-snacks',
    meal_type: 'snacks',
    start_time: '05:00 PM',
    end_time: '06:00 PM',
    cutoff_time: '03:30 PM',
    cutoff_minutes: 90,
    dishes: [
      { id: 's1', name: 'Crispy Veg Pakoda', category: 'Snack', is_veg: true, cooked_kg: 25, leftover_kg: 1.2 },
      { id: 's2', name: 'Green Mint Chutney', category: 'Dip', is_veg: true, cooked_kg: 10, leftover_kg: 0.5 },
      { id: 's3', name: 'Filter Coffee & Adrak Chai', category: 'Beverage', is_veg: true, cooked_kg: 28, leftover_kg: 1.8 }
    ]
  },
  {
    id: 'slot-dinner',
    meal_type: 'dinner',
    start_time: '07:30 PM',
    end_time: '09:30 PM',
    cutoff_time: '05:30 PM',
    cutoff_minutes: 120,
    dishes: [
      { id: 'd1', name: 'Kadhai Chicken / Shahi Chaap', category: 'Main', is_veg: false, cooked_kg: 60, leftover_kg: 2.8 },
      { id: 'd2', name: 'Yellow Moong Dal Fry', category: 'Dal', is_veg: true, cooked_kg: 45, leftover_kg: 3.0 },
      { id: 'd3', name: 'Steamed White Rice', category: 'Rice', is_veg: true, cooked_kg: 50, leftover_kg: 5.5 },
      { id: 'd4', name: 'Whole Wheat Phulka', category: 'Bread', is_veg: true, cooked_kg: 38, leftover_kg: 1.9 },
      { id: 'd5', name: 'Hot Gulab Jamun', category: 'Dessert', is_veg: true, cooked_kg: 25, leftover_kg: 0.4 }
    ]
  }
];

const DEFAULT_ACTIONS: ActionItem[] = [
  {
    id: 'a1',
    student_feedback: 'Dal Tadka was reported too salty on Tuesday dinner by 18 students',
    action_taken: 'Head chef revised salt standard measurement from 45g to 32g per 10kg batch and logged spice control checklist.',
    status: 'resolved',
    date: 'Oct 17, 2026',
    impact_summary: 'Average dish rating recovered to 4.5★ with zero subsequent salt remarks.'
  },
  {
    id: 'a2',
    student_feedback: 'High leftover rice recorded every Thursday lunch (~14 kg wasted)',
    action_taken: 'Reduced Thursday rice batch preparation by 12 kg and shifted portions toward extra Dal Makhani.',
    status: 'resolved',
    date: 'Oct 14, 2026',
    impact_summary: 'Rice waste dropped by 78% on subsequent Thursdays.'
  },
  {
    id: 'a3',
    student_feedback: 'Cold chapattis during 8:30 PM late dinner rush',
    action_taken: 'Procured second thermal rotimatic warmer to keep rotis fresh and hot until 9:30 PM service close.',
    status: 'in_progress',
    date: 'Oct 18, 2026',
    impact_summary: 'Equipment ordered and electrical socket installation underway.'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Organization and Personas with required defaults
  const [organizationName, setOrganizationNameState] = useState<string>(() => {
    return localStorage.getItem('mp_org_name') || 'Sri Sri University, Cuttack';
  });

  const [kitchenName, setKitchenNameState] = useState<string>(() => {
    return localStorage.getItem('mp_kitchen_name') || 'Kaivalya';
  });

  const [studentName, setStudentNameState] = useState<string>(() => {
    return localStorage.getItem('mp_student_name') || 'Mausam Kumar Nayak';
  });

  const [staffName, setStaffNameState] = useState<string>(() => {
    return localStorage.getItem('mp_staff_name') || 'Ramesh Nayak (Kitchen Supervisor)';
  });

  const [wardenName, setWardenNameState] = useState<string>(() => {
    return localStorage.getItem('mp_warden_name') || 'Prof. S. Mohapatra (Hostel Warden)';
  });

  const [adminName, setAdminNameState] = useState<string>(() => {
    return localStorage.getItem('mp_admin_name') || 'Dr. A. K. Sharma (Director of Affairs)';
  });

  // Slots and Menu
  const [slots, setSlots] = useState<MealSlotConfig[]>(() => {
    const saved = localStorage.getItem('mp_menu_slots');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_SLOTS;
  });

  // Skips dictionary (slotId -> boolean)
  const [skippedSlotIds, setSkippedSlotIds] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('mp_skipped_slots');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {};
  });

  // Ratings dictionary (slotId -> { score, tags })
  const [ratings, setRatings] = useState<Record<string, { score: number; tags: string[] }>>(() => {
    const saved = localStorage.getItem('mp_ratings');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {};
  });

  // Actions
  const [actions, setActions] = useState<ActionItem[]>(() => {
    const saved = localStorage.getItem('mp_actions');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_ACTIONS;
  });

  // Storage sync
  useEffect(() => {
    localStorage.setItem('mp_org_name', organizationName);
  }, [organizationName]);

  useEffect(() => {
    localStorage.setItem('mp_kitchen_name', kitchenName);
  }, [kitchenName]);

  useEffect(() => {
    localStorage.setItem('mp_student_name', studentName);
  }, [studentName]);

  useEffect(() => {
    localStorage.setItem('mp_staff_name', staffName);
  }, [staffName]);

  useEffect(() => {
    localStorage.setItem('mp_warden_name', wardenName);
  }, [wardenName]);

  useEffect(() => {
    localStorage.setItem('mp_admin_name', adminName);
  }, [adminName]);

  useEffect(() => {
    localStorage.setItem('mp_menu_slots', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('mp_skipped_slots', JSON.stringify(skippedSlotIds));
  }, [skippedSlotIds]);

  useEffect(() => {
    localStorage.setItem('mp_ratings', JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    localStorage.setItem('mp_actions', JSON.stringify(actions));
  }, [actions]);

  // Setters with persistence
  const setOrganizationName = (name: string) => setOrganizationNameState(name);
  const setKitchenName = (name: string) => setKitchenNameState(name);
  const setStudentName = (name: string) => setStudentNameState(name);
  const setStaffName = (name: string) => setStaffNameState(name);
  const setWardenName = (name: string) => setWardenNameState(name);
  const setAdminName = (name: string) => setAdminNameState(name);

  // Menu handlers
  const addDishToSlot = (slotId: string, dish: Omit<DishItem, 'id'>) => {
    const newDish: DishItem = {
      ...dish,
      id: `dish-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      cooked_kg: dish.cooked_kg || 25,
      leftover_kg: dish.leftover_kg || 1.5
    };
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, dishes: [...s.dishes, newDish] } : s))
    );
  };

  const editDishInSlot = (slotId: string, dishId: string, updated: Partial<DishItem>) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? {
              ...s,
              dishes: s.dishes.map((d) => (d.id === dishId ? { ...d, ...updated } : d))
            }
          : s
      )
    );
  };

  const deleteDishFromSlot = (slotId: string, dishId: string) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? {
              ...s,
              dishes: s.dishes.filter((d) => d.id !== dishId)
            }
          : s
      )
    );
  };

  const resetDefaultMenu = () => {
    setSlots(DEFAULT_SLOTS);
  };

  // Student Skip toggle (strictly per slot ID!)
  const toggleSkipSlot = (slotId: string) => {
    setSkippedSlotIds((prev) => ({
      ...prev,
      [slotId]: !prev[slotId]
    }));
  };

  // Rating submit
  const submitRating = (slotId: string, score: number, tags: string[]) => {
    setRatings((prev) => ({
      ...prev,
      [slotId]: { score, tags }
    }));
  };

  // Actions
  const addAction = (item: Omit<ActionItem, 'id' | 'date'>) => {
    const newAction: ActionItem = {
      ...item,
      id: `act-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setActions((prev) => [newAction, ...prev]);
  };

  const updateActionStatus = (id: string, status: 'resolved' | 'in_progress' | 'planned') => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  return (
    <AppContext.Provider
      value={{
        organizationName,
        setOrganizationName,
        kitchenName,
        setKitchenName,
        studentName,
        setStudentName,
        staffName,
        setStaffName,
        wardenName,
        setWardenName,
        adminName,
        setAdminName,
        slots,
        addDishToSlot,
        editDishInSlot,
        deleteDishFromSlot,
        resetDefaultMenu,
        skippedSlotIds,
        toggleSkipSlot,
        ratings,
        submitRating,
        actions,
        addAction,
        updateActionStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
