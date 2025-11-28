-- Add user_type column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_type text DEFAULT 'normal' CHECK (user_type IN ('authority', 'normal'));

-- Add authority-specific fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS authority_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fire_station text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badge_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department text;

-- Create location_requests table for normal users
CREATE TABLE IF NOT EXISTS public.location_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location_name text NOT NULL,
  region text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  thingspeak_channel_id text NOT NULL,
  thingspeak_read_key text NOT NULL,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone
);

-- Enable RLS on location_requests
ALTER TABLE public.location_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view their own location requests"
ON public.location_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own requests
CREATE POLICY "Users can create location requests"
ON public.location_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Authorities can view all requests
CREATE POLICY "Authorities can view all location requests"
ON public.location_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'authority'
  )
);

-- Policy: Authorities can update requests
CREATE POLICY "Authorities can update location requests"
ON public.location_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'authority'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_location_requests_updated_at
BEFORE UPDATE ON public.location_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();