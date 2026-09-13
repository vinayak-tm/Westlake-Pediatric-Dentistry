/*
# Create Westlake appointment requests

1. New Tables
- `appointments` stores public appointment requests for the pediatric practice.
- `id` unique appointment identifier.
- `parent_name`, `email`, `phone` contact details supplied by the parent.
- `child_name` and `visit_type` describe the patient and requested care.
- `preferred_date` and `preferred_time` capture the selected slot.
- `status` tracks request progress and defaults to `new`.
- `created_at` records when the request was submitted.
2. Security
- Row level security is enabled.
- Public visitors may submit appointment requests and read the shared appointment queue for this single-tenant demo dashboard.
- Update and delete policies are included for the administrative view.
3. Important notes
- No authentication is added because the requested experience does not include a sign-in screen.
- Policies allow the anon browser client to complete the booking flow.
*/

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  child_name text NOT NULL,
  visit_type text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_appointments" ON public.appointments;
CREATE POLICY "public_select_appointments" ON public.appointments FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_appointments" ON public.appointments;
CREATE POLICY "public_insert_appointments" ON public.appointments FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_appointments" ON public.appointments;
CREATE POLICY "public_update_appointments" ON public.appointments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_appointments" ON public.appointments;
CREATE POLICY "public_delete_appointments" ON public.appointments FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS appointments_preferred_date_idx ON public.appointments (preferred_date);
CREATE INDEX IF NOT EXISTS appointments_created_at_idx ON public.appointments (created_at DESC);