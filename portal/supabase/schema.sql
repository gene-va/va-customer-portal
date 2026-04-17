-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  report_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMPTZ
);

-- Add phase column to reports (review -> outreach)
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS phase TEXT NOT NULL DEFAULT 'review'
  CHECK (phase IN ('review', 'outreach'));

-- Create investor_annotations table (client review of prospects)
CREATE TABLE IF NOT EXISTS public.investor_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports ON DELETE CASCADE,
  investor_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pursue', 'already_known', 'skip')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (report_id, investor_name)
);

DROP TRIGGER IF EXISTS update_investor_annotations_updated_at ON public.investor_annotations;
CREATE TRIGGER update_investor_annotations_updated_at
  BEFORE UPDATE ON public.investor_annotations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.investor_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investor_annotations_admins_full_access" ON public.investor_annotations
  USING (public.is_admin());

CREATE POLICY "investor_annotations_clients_rw_own" ON public.investor_annotations
  USING (
    report_id IN (
      SELECT r.id FROM public.reports r
      JOIN public.clients c ON c.id = r.client_id
      WHERE c.user_id = auth.uid() AND r.status = 'published'
    )
  );

CREATE INDEX IF NOT EXISTS idx_investor_annotations_report_id ON public.investor_annotations(report_id);

-- Create report_versions table
CREATE TABLE IF NOT EXISTS public.report_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports ON DELETE CASCADE,
  report_data JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users ON DELETE RESTRICT,
  action_type TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to clients table
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Apply updated_at trigger to reports table
DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- user_roles RLS policies
CREATE POLICY "user_roles_admins_read_all" ON public.user_roles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "user_roles_users_read_own" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- clients RLS policies
CREATE POLICY "clients_admins_full_access" ON public.clients
  USING (public.is_admin());

CREATE POLICY "clients_clients_read_own" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

-- reports RLS policies
CREATE POLICY "reports_admins_full_access" ON public.reports
  USING (public.is_admin());

CREATE POLICY "reports_clients_read_published" ON public.reports
  FOR SELECT USING (
    status = 'published'
    AND client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- report_versions RLS policies
CREATE POLICY "report_versions_admins_only" ON public.report_versions
  USING (public.is_admin());

-- audit_log RLS policies
CREATE POLICY "audit_log_admins_only" ON public.audit_log
  USING (public.is_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON public.clients(is_active);
CREATE INDEX IF NOT EXISTS idx_reports_client_id ON public.reports(client_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_published_at ON public.reports(published_at);
CREATE INDEX IF NOT EXISTS idx_report_versions_report_id ON public.report_versions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_versions_created_by ON public.report_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_user_id ON public.audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

-- =====================================================================
-- Service Blocks + Campaigns
-- =====================================================================

-- A client's subscription to one service block, plus their captured requirements.
CREATE TABLE IF NOT EXISTS public.client_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients ON DELETE CASCADE,
  service_type TEXT NOT NULL
    CHECK (service_type IN ('asset_matching', 'investment_matching', 'market_access', 'other')),
  requirements_data JSONB NOT NULL DEFAULT '{}',
  requirements_updated_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (client_id, service_type)
);

DROP TRIGGER IF EXISTS update_client_services_updated_at ON public.client_services;
CREATE TRIGGER update_client_services_updated_at
  BEFORE UPDATE ON public.client_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.client_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_services_admins_full" ON public.client_services
  USING (public.is_admin());

CREATE POLICY "client_services_clients_read_own" ON public.client_services
  FOR SELECT USING (
    active = TRUE
    AND client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_client_services_client_id ON public.client_services(client_id);

-- Upgrade reports into campaigns semantically: tie to a client_service, add type + event name.
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS client_service_id UUID REFERENCES public.client_services ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS campaign_type TEXT NOT NULL DEFAULT 'general'
    CHECK (campaign_type IN ('event', 'general')),
  ADD COLUMN IF NOT EXISTS event_name TEXT;

-- Backfill: one client_service per (client, mapped service_type) for every existing report.
INSERT INTO public.client_services (client_id, service_type)
SELECT DISTINCT r.client_id, CASE
  WHEN r.report_data->>'version' = 'v3' THEN 'asset_matching'
  WHEN r.report_data->>'version' = 'v2' THEN 'investment_matching'
  ELSE 'other'
END
FROM public.reports r
ON CONFLICT (client_id, service_type) DO NOTHING;

-- Tie each existing report to its parent client_service.
UPDATE public.reports r SET client_service_id = (
  SELECT cs.id FROM public.client_services cs
  WHERE cs.client_id = r.client_id AND cs.service_type = CASE
    WHEN r.report_data->>'version' = 'v3' THEN 'asset_matching'
    WHEN r.report_data->>'version' = 'v2' THEN 'investment_matching'
    ELSE 'other'
  END
  LIMIT 1
)
WHERE r.client_service_id IS NULL;

-- Uploads that carry an event name (V3 ProspectResearch) become event campaigns.
UPDATE public.reports SET
  campaign_type = 'event',
  event_name = report_data->'event'->>'name'
WHERE campaign_type = 'general'
  AND report_data->'event'->>'name' IS NOT NULL;

ALTER TABLE public.reports ALTER COLUMN client_service_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reports_client_service_id ON public.reports(client_service_id);
CREATE INDEX IF NOT EXISTS idx_reports_campaign_type ON public.reports(campaign_type);

-- =====================================================================
-- Primary service block per client
-- =====================================================================

ALTER TABLE public.client_services
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_services_one_primary_per_client
  ON public.client_services(client_id)
  WHERE is_primary = TRUE;

WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY client_id ORDER BY started_at ASC, id ASC) AS rn
  FROM public.client_services
  WHERE active = TRUE
)
UPDATE public.client_services cs
SET is_primary = TRUE
FROM ranked
WHERE cs.id = ranked.id
  AND ranked.rn = 1
  AND NOT EXISTS (
    SELECT 1 FROM public.client_services existing
    WHERE existing.client_id = cs.client_id AND existing.is_primary = TRUE
  );

CREATE OR REPLACE FUNCTION public.reassign_primary_on_deactivate()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_primary = TRUE AND NEW.active = FALSE THEN
    NEW.is_primary := FALSE;
    UPDATE public.client_services
    SET is_primary = TRUE
    WHERE id = (
      SELECT id FROM public.client_services
      WHERE client_id = NEW.client_id
        AND active = TRUE
        AND id <> NEW.id
      ORDER BY started_at ASC, id ASC
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reassign_primary_on_deactivate ON public.client_services;
CREATE TRIGGER reassign_primary_on_deactivate
  BEFORE UPDATE ON public.client_services
  FOR EACH ROW
  EXECUTE FUNCTION public.reassign_primary_on_deactivate();
