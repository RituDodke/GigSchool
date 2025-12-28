# Task: Profile Portfolios

## Goal
Allow users to upload and display portfolio items on their profile.

---

## Database Changes

### Run in Supabase SQL Editor:
```sql
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  file_url TEXT,
  file_type TEXT, -- 'image', 'pdf', 'link'
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view portfolios"
  ON public.portfolio_items FOR SELECT USING (true);

CREATE POLICY "Users can manage own portfolio"
  ON public.portfolio_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio"
  ON public.portfolio_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio"
  ON public.portfolio_items FOR DELETE
  USING (auth.uid() = user_id);
```

### Create Storage Bucket in Supabase:
1. Go to Storage → New Bucket
2. Name: `portfolios`
3. Public bucket: Yes
4. Add policy: Allow authenticated uploads

---

## Backend Changes

### 1. Create Schema: `backend/app/schemas/portfolio.py`
```python
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class PortfolioItemCreate(BaseModel):
    title: str
    description: str | None = None
    link: str | None = None
    file_url: str | None = None
    file_type: str  # 'image', 'pdf', 'link'

class PortfolioItem(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: str | None
    link: str | None
    file_url: str | None
    file_type: str
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### 2. Create Repository: `backend/app/repositories/portfolio_repository.py`
- `get_by_user(user_id)` - Get all portfolio items for a user
- `create(item_in, user_id)` - Create new item
- `delete(item_id, user_id)` - Delete item (verify ownership)

### 3. Create Endpoint: `backend/app/api/v1/endpoints/portfolio.py`
- `GET /users/{user_id}/portfolio` - Get user's portfolio
- `POST /portfolio` - Add portfolio item
- `DELETE /portfolio/{item_id}` - Remove item

### 4. Register in `backend/app/api/v1/api.py`

---

## Frontend Changes

### 1. Create API: `frontend/src/api/portfolio.ts`
```typescript
export interface PortfolioItem {
    id: string
    user_id: string
    title: string
    description: string | null
    link: string | null
    file_url: string | null
    file_type: 'image' | 'pdf' | 'link'
    created_at: string
}

export const portfolioApi = {
    getUserPortfolio: async (userId: string) => {...},
    addItem: async (data: PortfolioItemCreate) => {...},
    deleteItem: async (itemId: string) => {...},
}
```

### 2. Create PortfolioUploader Component
```tsx
// frontend/src/components/PortfolioUploader.tsx
- File input for images/PDFs
- URL input for links
- Title and description fields
- Upload to Supabase Storage
- Save metadata to database
```

### 3. Create PortfolioGrid Component
```tsx
// frontend/src/components/PortfolioGrid.tsx
- Display items in a grid
- Image items: show thumbnail with lightbox
- PDF items: show icon with download link
- Link items: show icon with external link
- Delete button on own items
```

### 4. Update ProfilePage.tsx
- Add "Portfolio" tab
- Show PortfolioGrid in tab content
- Add "Upload" button (only on own profile)
- Modal with PortfolioUploader on click

---

## File Upload Implementation

```typescript
// Upload file to Supabase Storage
const uploadFile = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
    const { error } = await supabase.storage
        .from('portfolios')
        .upload(fileName, file)
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
        .from('portfolios')
        .getPublicUrl(fileName)
    
    return publicUrl
}
```

---

## Verification
1. Go to Profile page
2. Click "Add Portfolio Item"
3. Upload an image → should display in grid
4. Upload a PDF → should show PDF icon
5. Add a link → should show link icon
6. Delete an item → should remove from grid
7. View another user's profile → should see their portfolio (read-only)
