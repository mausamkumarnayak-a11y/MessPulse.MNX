export type UserRole = 'student' | 'staff' | 'warden' | 'admin';
export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';
export type ActionStatus = 'open' | 'in_progress' | 'resolved';

export interface User {
  id: string;
  mess_id: string;
  role: UserRole;
  display_name: string;
  email: string;
  created_at: string;
}

export interface Dish {
  id: string;
  mess_id: string;
  name: string;
  veg_flag: boolean;
  category?: string;
}

export interface MealSlot {
  id: string;
  mess_id: string;
  date: string;
  meal_type: MealType;
  start_time: string;
  end_time: string;
  dishes: Dish[];
  is_skipped: boolean;
  is_rated: boolean;
  user_rating?: number | null;
  can_skip: boolean;
  cutoff_time_str: string;
  headcount_served?: number | null;
  total_waste_kg?: number | null;
}

export interface RatingPayload {
  dish_id?: string;
  score: number;
  tags: string[];
  comment?: string;
}

export interface RatingResponse {
  id: string;
  slot_id: string;
  dish_id?: string;
  score: number;
  tags: string[];
  comment?: string;
  created_at: string;
}

export interface WasteEntry {
  dish_id: string;
  leftover_kg: number;
  notes?: string;
}

export interface WasteLogItem {
  id: string;
  slot_id: string;
  dish_id: string;
  dish_name?: string;
  leftover_kg: number;
  notes?: string;
  created_at: string;
}

export interface ActionItem {
  id: string;
  mess_id: string;
  title: string;
  description: string;
  linked_dish_id?: string;
  dish_name?: string;
  status: ActionStatus;
  outcome?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DishWasteStat {
  dish_id: string;
  dish_name: string;
  total_waste_kg: number;
  avg_leftover_per_slot_kg: number;
  service_count: number;
}

export interface WasteInsights {
  total_waste_kg: number;
  total_headcount_served: number;
  waste_per_head_kg: number;
  days_analyzed: number;
  top_wasted_dishes: DishWasteStat[];
  daily_trend: Array<{
    date: string;
    weekday: string;
    waste_kg: number;
    headcount: number;
  }>;
}

export interface DishRatingStat {
  dish_id: string;
  dish_name: string;
  rating_count: number;
  average_score?: number | null;
  sample_size_met: boolean;
  status_note: string;
}

export interface RatingsInsights {
  total_ratings_count: number;
  overall_average_score?: number | null;
  sample_size_met: boolean;
  status_message: string;
  tag_breakdown: Record<string, number>;
  dish_scores: DishRatingStat[];
}

export interface ExpectedHeadcount {
  slot_id: string;
  meal_type: MealType;
  registered_students: number;
  skips_recorded: number;
  historical_showup_rate: number;
  expected_headcount: number;
  expected_range_low: number;
  expected_range_high: number;
  confidence_note: string;
}

export interface PublicWasteMeter {
  mess_name: string;
  total_waste_this_week_kg: number;
  waste_per_student_per_meal_kg: number;
  weekly_waste_reduced_pct: number;
  participating_students_count: number;
  meals_skipped_on_time: number;
  recent_actions: ActionItem[];
  daily_history: Array<{
    date: string;
    day: string;
    waste_kg: number;
    headcount: number;
    waste_per_head: number;
  }>;
}

export interface TourProgress {
  tour_id: string;
  step: number;
  completed: boolean;
}

export interface HelpArticle {
  id: string;
  role_target: string;
  category: string;
  title: string;
  summary: string;
  content: string;
}
