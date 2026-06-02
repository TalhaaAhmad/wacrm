-- ============================================================
-- 013_shopify_integration.sql — Shopify webhook integration
--
-- Idempotent migration — safe to run multiple times.
-- Uses IF NOT EXISTS for tables/indexes and DROP IF EXISTS
-- for policies/triggers (Postgres has no CREATE POLICY IF NOT EXISTS).
-- ============================================================

-- ============================================================
-- SHOPIFY_STORES
-- ============================================================
CREATE TABLE IF NOT EXISTS shopify_stores (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  store_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  webhook_secret TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, shop_domain)
);

CREATE INDEX IF NOT EXISTS idx_shopify_stores_user_id ON shopify_stores(user_id);

ALTER TABLE shopify_stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own shopify stores" ON shopify_stores;
CREATE POLICY "Users can manage own shopify stores" ON shopify_stores FOR ALL
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_updated_at ON shopify_stores;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON shopify_stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SHOPIFY_NOTIFICATION_RULES
-- ============================================================
CREATE TABLE IF NOT EXISTS shopify_notification_rules (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES shopify_stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('order_created', 'order_fulfilled')),
  template_name TEXT NOT NULL,
  template_language TEXT NOT NULL DEFAULT 'en_US',
  variable_mapping JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_shopify_notification_rules_store_id
  ON shopify_notification_rules(store_id);
CREATE INDEX IF NOT EXISTS idx_shopify_notification_rules_user_id
  ON shopify_notification_rules(user_id);

ALTER TABLE shopify_notification_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own shopify notification rules" ON shopify_notification_rules;
CREATE POLICY "Users can manage own shopify notification rules" ON shopify_notification_rules FOR ALL
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_updated_at ON shopify_notification_rules;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON shopify_notification_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SHOPIFY_WEBHOOK_LOGS
--
-- Service-role only — writes originate from the webhook receiver,
-- not from the browser. Reads are exposed via RLS for the UI log view.
-- ============================================================
CREATE TABLE IF NOT EXISTS shopify_webhook_logs (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES shopify_stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'processed'
    CHECK (status IN ('processed', 'failed', 'skipped')),
  error_message TEXT,
  whatsapp_message_id TEXT,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopify_webhook_logs_store_id
  ON shopify_webhook_logs(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shopify_webhook_logs_user_id
  ON shopify_webhook_logs(user_id);

ALTER TABLE shopify_webhook_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own shopify webhook logs" ON shopify_webhook_logs;
CREATE POLICY "Users can view own shopify webhook logs" ON shopify_webhook_logs FOR ALL
  USING (auth.uid() = user_id);
