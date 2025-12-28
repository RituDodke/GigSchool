# Task: Rich Text Descriptions

## Goal
Enable markdown formatting for gig descriptions.

## Changes Required

### Frontend Only (No Backend Changes)

#### 1. Install react-markdown
```bash
cd c:\new school project\gigschool\frontend
npm install react-markdown
```

#### 2. Update JobDetailModal.tsx
File: `frontend/src/components/jobs/JobDetailModal.tsx`

Replace plain text description with markdown renderer:
```tsx
import ReactMarkdown from 'react-markdown'

// Find the description section and replace:
// <p>{job.description}</p>
// With:
<div className="prose prose-sm dark:prose-invert max-w-none">
    <ReactMarkdown>{job.description}</ReactMarkdown>
</div>
```

#### 3. Update JobCard.tsx
File: `frontend/src/components/jobs/JobCard.tsx`

For the preview, keep plain text (truncated) - no changes needed since we use `line-clamp-2`.

#### 4. Update CreateJobModal.tsx
File: `frontend/src/components/jobs/CreateJobModal.tsx`

Add markdown preview toggle:
```tsx
const [showPreview, setShowPreview] = useState(false)

// Add preview toggle button near description textarea
<button onClick={() => setShowPreview(!showPreview)}>
    {showPreview ? 'Edit' : 'Preview'}
</button>

// Conditional render:
{showPreview ? (
    <ReactMarkdown>{description}</ReactMarkdown>
) : (
    <textarea value={description} onChange={...} />
)}
```

#### 5. Add Tailwind Typography Plugin (Optional)
```bash
npm install @tailwindcss/typography
```

Update `tailwind.config.js`:
```js
plugins: [require('@tailwindcss/typography')],
```

## Verification
1. Create a gig with markdown: `**bold**, *italic*, - list items`
2. View the gig - formatting should render
3. Preview should work in create modal
