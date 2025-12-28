# Task: Rating & Review System

## Goal
Allow users to rate and review each other after gig completion.

---

## Database Changes

### Run in Supabase SQL Editor:
```sql
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) NOT NULL,
  reviewer_id UUID REFERENCES public.users(id) NOT NULL,
  reviewee_id UUID REFERENCES public.users(id) NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, reviewer_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);
```

---

## Backend Changes

### 1. Create Schema: `backend/app/schemas/review.py`
```python
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class ReviewCreate(BaseModel):
    job_id: UUID
    reviewee_id: UUID
    rating: int  # 1-5
    comment: str | None = None

class Review(BaseModel):
    id: UUID
    job_id: UUID
    reviewer_id: UUID
    reviewee_id: UUID
    rating: int
    comment: str | None
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### 2. Create Repository: `backend/app/repositories/review_repository.py`
- `get_by_reviewee(user_id)` - Get all reviews for a user
- `get_average_rating(user_id)` - Calculate average rating
- `create(review_in, reviewer_id)` - Create new review
- `can_review(job_id, reviewer_id)` - Check if job is COMPLETED and user was involved

### 3. Create Endpoint: `backend/app/api/v1/endpoints/reviews.py`
- `POST /reviews` - Submit a review
- `GET /users/{user_id}/reviews` - Get reviews for a user
- `GET /users/{user_id}/rating` - Get average rating

### 4. Register in `backend/app/api/v1/api.py`
```python
from app.api.v1.endpoints import reviews
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
```

---

## Frontend Changes

### 1. Create API: `frontend/src/api/reviews.ts`
```typescript
export interface Review {
    id: string
    job_id: string
    reviewer_id: string
    reviewee_id: string
    rating: number
    comment: string | null
    created_at: string
}

export const reviewsApi = {
    getUserReviews: async (userId: string) => {...},
    getUserRating: async (userId: string) => {...},
    createReview: async (data: ReviewCreate) => {...},
}
```

### 2. Create Star Rating Component: `frontend/src/components/StarRating.tsx`
- Display 1-5 stars
- Interactive mode for input
- Read-only mode for display

### 3. Update ProfilePage.tsx
- Show average rating next to username
- Add "Reviews" tab showing received reviews

### 4. Create ReviewModal.tsx
- Form with star rating selector
- Comment textarea
- Submit button

### 5. Add Review Prompt in JobDetailModal
- Show "Leave Review" button when job is COMPLETED
- Open ReviewModal on click

---

## Verification
1. Complete a gig (mark as COMPLETED)
2. Both parties should see "Leave Review" option
3. Submit a review with rating + comment
4. View reviews on Profile page
5. Average rating should display correctly
