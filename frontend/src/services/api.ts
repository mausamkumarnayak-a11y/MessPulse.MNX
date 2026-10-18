import {
  User, MealSlot, Dish, RatingPayload, RatingResponse,
  WasteEntry, WasteLogItem, ActionItem, WasteInsights,
  RatingsInsights, ExpectedHeadcount, PublicWasteMeter,
  TourProgress, HelpArticle, ActionStatus
} from '../types';

const API_BASE = '/api/v1';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('messpulse_token');
  }

  setToken(token: string) {
    localStorage.setItem('messpulse_token', token);
  }

  clearToken() {
    localStorage.removeItem('messpulse_token');
    localStorage.removeItem('messpulse_user');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Clear expired credentials
      this.clearToken();
      window.dispatchEvent(new Event('messpulse_unauthorized'));
    }

    if (!response.ok) {
      let errorMsg = `Request failed: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorMsg = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // use fallback text
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // 1. Auth API
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.access_token);
    localStorage.setItem('messpulse_user', JSON.stringify(data.user));
    return data;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // 2. Meal Slots & Menus
  async getTodaySlots(): Promise<MealSlot[]> {
    return this.request<MealSlot[]>('/slots/today');
  }

  async getSlotsByDate(dateStr: string): Promise<MealSlot[]> {
    return this.request<MealSlot[]>(`/slots/by-date/${dateStr}`);
  }

  async getDishes(): Promise<Dish[]> {
    return this.request<Dish[]>('/dishes');
  }

  async createDish(data: { name: string; veg_flag: boolean; category?: string }): Promise<Dish> {
    return this.request<Dish>('/dishes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateMenuForDate(dateStr: string, slots: Array<{
    meal_type: string;
    start_time: string;
    end_time: string;
    dish_ids: string[];
  }>): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/menus/${dateStr}`, {
      method: 'PUT',
      body: JSON.stringify({ slots })
    });
  }

  // 3. Student Ratings & Skips
  async submitRating(slotId: string, payload: RatingPayload): Promise<RatingResponse> {
    return this.request<RatingResponse>(`/slots/${slotId}/rating`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async markSkip(slotId: string): Promise<{ id: string; slot_id: string }> {
    return this.request<{ id: string; slot_id: string }>(`/slots/${slotId}/skip`, {
      method: 'POST'
    });
  }

  async undoSkip(slotId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/slots/${slotId}/skip`, {
      method: 'DELETE'
    });
  }

  async getStudentImpact(): Promise<{
    student_name: string;
    meals_skipped_on_time: number;
    estimated_food_saved_kg: number;
    impact_summary: string;
  }> {
    return this.request('/students/my-impact');
  }

  // 4. Kitchen Operations
  async logHeadcount(slotId: string, servedCount: number): Promise<{ id: string; served_count: number }> {
    return this.request(`/slots/${slotId}/headcount`, {
      method: 'POST',
      body: JSON.stringify({ served_count: servedCount })
    });
  }

  async logWasteBatch(slotId: string, entries: WasteEntry[]): Promise<WasteLogItem[]> {
    return this.request<WasteLogItem[]>(`/slots/${slotId}/waste`, {
      method: 'POST',
      body: JSON.stringify({ entries })
    });
  }

  // 5. Insights & Analytics
  async getWasteInsights(startDate?: string, endDate?: string): Promise<WasteInsights> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<WasteInsights>(`/insights/waste${query}`);
  }

  async getRatingsInsights(): Promise<RatingsInsights> {
    return this.request<RatingsInsights>('/insights/ratings');
  }

  async getExpectedHeadcount(slotId: string): Promise<ExpectedHeadcount> {
    return this.request<ExpectedHeadcount>(`/insights/expected-headcount?slot_id=${slotId}`);
  }

  // 6. Action Tracker ("You Said, We Did")
  async listActions(statusFilter?: ActionStatus): Promise<ActionItem[]> {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    return this.request<ActionItem[]>(`/actions${query}`);
  }

  async createAction(data: {
    title: string;
    description: string;
    linked_dish_id?: string;
    status: ActionStatus;
    outcome?: string;
  }): Promise<ActionItem> {
    return this.request<ActionItem>('/actions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateAction(actionId: string, data: Partial<{
    title: string;
    description: string;
    linked_dish_id: string;
    status: ActionStatus;
    outcome: string;
  }>): Promise<ActionItem> {
    return this.request<ActionItem>(`/actions/${actionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // 7. Public Waste Meter
  async getPublicWasteMeter(): Promise<PublicWasteMeter> {
    return this.request<PublicWasteMeter>('/public/waste-meter');
  }

  // 8. Onboarding Tour
  async getTourProgress(tourId: string = 'default'): Promise<TourProgress | null> {
    return this.request<TourProgress | null>(`/tour/progress?tour_id=${tourId}`);
  }

  async updateTourProgress(tourId: string, step: number, completed: boolean): Promise<TourProgress> {
    return this.request<TourProgress>('/tour/progress', {
      method: 'PUT',
      body: JSON.stringify({ tour_id: tourId, step, completed })
    });
  }

  // 9. Help Center
  async getHelpArticles(role?: string, search?: string): Promise<HelpArticle[]> {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<HelpArticle[]>(`/help/articles${query}`);
  }
}

export const api = new ApiService();
