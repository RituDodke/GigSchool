-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS Table
-- Matches app/schemas/user.py
create table public.users (
  id uuid primary key references auth.users(id), -- Linked to Supabase Auth
  email text not null,
  username text,
  avatar_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Enable RLS for Users
alter table public.users enable row level security;

-- Policy: Users can read their own profile
create policy "Users can read own profile"
  on public.users for select
  using ( auth.uid() = id );

-- Policy: Service Role (Backend) can do anything (Bypasses RLS usually, but good to have)
-- Note: Our Python backend uses the Service Key (if configured) or the User's JWT.
-- If using Service Key, RLS is bypassed. If using User JWT, this policy applies.

-- 2. JOBS Table
-- Matches app/schemas/job.py
create table public.jobs (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid references public.users(id) not null,
  group_id text not null default 'general', -- e.g. "college-engineering"
  title text not null,
  description text not null,
  tags text[] default '{}',
  category text default 'general', -- general, tutoring, design, coding, writing, other
  resume_required boolean default false,
  status text default 'OPEN', -- OPEN, CLOSED, COMPLETED
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Enable RLS for Jobs
alter table public.jobs enable row level security;

-- Policy: Anyone can read jobs (Public Board)
create policy "Anyone can read jobs"
  on public.jobs for select
  using ( true );

-- Policy: Authenticated users can create jobs
create policy "Auth users can create jobs"
  on public.jobs for insert
  with check ( auth.uid() = creator_id );

-- Policy: Creator can update/delete their jobs
create policy "Creators can update own jobs"
  on public.jobs for update
  using ( auth.uid() = creator_id );


-- 3. APPLICATIONS Table
-- Matches app/schemas/application.py
create table public.applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references public.jobs(id) not null,
  applicant_id uuid references public.users(id) not null,
  pitch text,
  status text default 'PENDING', -- PENDING, ACCEPTED, REJECTED
  created_at timestamptz default now()
);

-- Enable RLS for Applications
alter table public.applications enable row level security;

-- Policy: Job Owner can see applications for their jobs
-- (This requires a join, which is complex in simple RLS. 
--  Simplification: Users can see applications where they are the Creator of the JOB OR the Applicant)
--  For V1, let's keep it simple: Applicant can see own, Creator can see.
create policy "Applicants can see own applications"
  on public.applications for select
  using ( auth.uid() = applicant_id );

-- Policy: Job creators can see applications for their jobs
create policy "Creators can see applications for own jobs"
  on public.applications for select
  using (
    exists (
      select 1 from public.jobs j
      where j.id = job_id
      and j.creator_id = auth.uid()
    )
  );

create policy "Applicants can create applications"
  on public.applications for insert
  with check ( auth.uid() = applicant_id );

-- Notes:
-- The backend (Service Role) will often bypass these for admin tasks, 
-- but the Frontend (User Client) needs these policies if using Supabase client directly.
-- Since we use Python Backend as a proxy, the Backend usually holds the "Power".
-- However, maintaining RLS is good practice.

-- 4. CONVERSATIONS Table (DMs between two users)
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user1_id uuid references public.users(id) not null,
  user2_id uuid references public.users(id) not null,
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS for Conversations
alter table public.conversations enable row level security;

-- Policy: Users can see their own conversations
create policy "Users can see own conversations"
  on public.conversations for select
  using ( auth.uid() = user1_id OR auth.uid() = user2_id );

-- Policy: Users can create conversations with others
create policy "Users can create conversations"
  on public.conversations for insert
  with check ( auth.uid() = user1_id OR auth.uid() = user2_id );

-- 5. MESSAGES Table
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.users(id) not null,
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS for Messages
alter table public.messages enable row level security;

-- Policy: Users can see messages in their conversations
create policy "Users can see messages in own conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- Policy: Users can send messages to their conversations
create policy "Users can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

