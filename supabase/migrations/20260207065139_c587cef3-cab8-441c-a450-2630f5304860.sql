
-- Add user_id to customers table
ALTER TABLE public.customers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to services table
ALTER TABLE public.services ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to profiles table  
ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE;

-- Add user_id to reminder_history
ALTER TABLE public.reminder_history ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies on customers
DROP POLICY IF EXISTS "Anyone can read customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can update customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can delete customers" ON public.customers;

-- New user-scoped policies for customers
CREATE POLICY "Users can read own customers" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customers" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customers" ON public.customers FOR DELETE USING (auth.uid() = user_id);

-- Drop old permissive policies on services
DROP POLICY IF EXISTS "Anyone can read services" ON public.services;
DROP POLICY IF EXISTS "Anyone can insert services" ON public.services;
DROP POLICY IF EXISTS "Anyone can update services" ON public.services;
DROP POLICY IF EXISTS "Anyone can delete services" ON public.services;

-- New user-scoped policies for services
CREATE POLICY "Users can read own services" ON public.services FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own services" ON public.services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own services" ON public.services FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own services" ON public.services FOR DELETE USING (auth.uid() = user_id);

-- Drop old permissive policies on profiles
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;

-- New user-scoped policies for profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Drop old permissive policies on reminder_history
DROP POLICY IF EXISTS "Anyone can read reminder_history" ON public.reminder_history;
DROP POLICY IF EXISTS "Anyone can insert reminder_history" ON public.reminder_history;

-- New user-scoped policies for reminder_history
CREATE POLICY "Users can read own reminder_history" ON public.reminder_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminder_history" ON public.reminder_history FOR INSERT WITH CHECK (auth.uid() = user_id);
