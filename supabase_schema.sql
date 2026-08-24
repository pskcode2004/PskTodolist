-- Members table (extends Supabase auth.users)
CREATE TABLE public.members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Todo table
CREATE TABLE public.todos (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  remark TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'use',
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS Policies for 'members' table
-- ==========================================
CREATE POLICY "Users can view own profile"
  ON public.members FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.members FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.members FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ==========================================
-- RLS Policies for 'todos' table
-- ==========================================
CREATE POLICY "Users can view own todos"
  ON public.todos FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Users can insert own todos"
  ON public.todos FOR INSERT
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update own todos"
  ON public.todos FOR UPDATE
  USING (auth.uid() = member_id);

CREATE POLICY "Users can delete own todos"
  ON public.todos FOR DELETE
  USING (auth.uid() = member_id);
