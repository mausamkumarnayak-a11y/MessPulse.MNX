# MessPulse API Specification Reference

All endpoints are versioned under `/api/v1` and exchange data as JSON.

## Authentication & Tokens
Protected endpoints require an HTTP Bearer Token in the `Authorization` header:
`Authorization: Bearer <jwt-token>`

---

## 1. Authentication (`/api/v1/auth`)

### `POST /api/v1/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "student@ashoka.edu",
    "password": "Password123!"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": "usr_std_01",
      "display_name": "Aarav Sharma",
      "email": "student@ashoka.edu",
      "role": "student",
      "mess_id": "mess_ashoka_01"
    }
  }
  ```

### `GET /api/v1/auth/me`
- **Access**: Authenticated (Any role)
- **Response** `200 OK`: Returns current user profile without password hash.

---

## 2. Meal Slots & Menus (`/api/v1/slots`, `/api/v1/menus`)

### `GET /api/v1/slots/today`
- **Access**: Authenticated
- **Response** `200 OK`: List of today's meal slots (Breakfast, Lunch, Snacks, Dinner) with associated dishes, user's skip status, cutoff status, and user's submitted rating.

### `PUT /api/v1/menus/{date}`
- **Access**: Staff, Warden, Admin
- **Request Body**: Array of slots with dish IDs and meal types for the given date (`YYYY-MM-DD`).

---

## 3. Student Actions (`/api/v1/slots/{id}/...`)

### `POST /api/v1/slots/{id}/rating`
- **Access**: Student only
- **Constraint**: One rating per slot per student.
- **Request Body**:
  ```json
  {
    "dish_id": "dish_paneer_tikka",
    "score": 5,
    "tags": ["taste", "temperature"],
    "comment": "Crispy and fresh paneer today!"
  }
  ```

### `POST /api/v1/slots/{id}/skip`
- **Access**: Student only
- **Constraint**: Must be before `start_time - cutoff_minutes`.
- **Response** `200 OK` or `400 Bad Request` if cutoff has passed.

### `DELETE /api/v1/slots/{id}/skip`
- **Access**: Student only
- **Constraint**: Must be before cutoff to undo.

---

## 4. Kitchen Operations (`/api/v1/slots/{id}/...`)

### `POST /api/v1/slots/{id}/headcount`
- **Access**: Staff, Warden, Admin
- **Request Body**:
  ```json
  {
    "served_count": 342
  }
  ```

### `POST /api/v1/slots/{id}/waste`
- **Access**: Staff, Warden, Admin
- **Request Body**:
  ```json
  {
    "entries": [
      { "dish_id": "dish_rice", "leftover_kg": 4.5, "notes": "Cold day surplus" },
      { "dish_id": "dish_dal", "leftover_kg": 2.0, "notes": "" }
    ]
  }
  ```

---

## 5. Insights & Analytics (`/api/v1/insights`)

### `GET /api/v1/insights/waste`
- **Access**: Staff, Warden, Admin
- **Query Params**: `start_date`, `end_date`, `slot_id`
- **Response**: Aggregated leftover weights, waste per head, top wasted dishes.

### `GET /api/v1/insights/ratings`
- **Access**: Staff, Warden, Admin
- **Enforcement**: Privacy Gate. Dish averages are hidden unless `rating_count >= 5`.
- **Response**: Anonymous distribution of scores and reason tags. Individual user identities are NEVER returned.

### `GET /api/v1/insights/expected-headcount?slot_id={id}`
- **Access**: Staff, Warden, Admin
- **Response**: Calculation breakdown: registered students, skips recorded, show-up multiplier, and final estimated headcount range.

---

## 6. Public & Community (`/api/v1/public`, `/api/v1/actions`)

### `GET /api/v1/public/waste-meter`
- **Access**: Public (No auth required)
- **Response**: Aggregated campus waste stats, total kg saved, and 7-day trend.

### `GET /api/v1/actions`
- **Access**: Public / Authenticated
- **Response**: List of "You Said, We Did" initiatives and resolved issues.

### `POST /api/v1/actions`
- **Access**: Warden, Admin
- **Request Body**:
  ```json
  {
    "title": "Reduced salt in Dal Tadka",
    "description": "Adjusted spice blend following 24 student comments on Tuesday lunch.",
    "linked_dish_id": "dish_dal",
    "status": "resolved",
    "outcome": "Salt rating dropped from 40% complaints to 2%."
  }
  ```

---

## 7. Tour & Help (`/api/v1/tour`, `/api/v1/help`)

### `GET /api/v1/tour/progress` & `PUT /api/v1/tour/progress`
- Reads or updates interactive tour progress for the logged-in user.

### `GET /api/v1/help/articles`
- Searchable user-guide and FAQ articles organized by role.
