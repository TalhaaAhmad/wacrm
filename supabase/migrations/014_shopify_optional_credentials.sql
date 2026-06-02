-- ============================================================
-- 014_shopify_optional_credentials.sql
--
-- Make access_token and webhook_secret optional for simplified
-- Shopify store setup (no API key or HMAC verification required).
-- ============================================================

ALTER TABLE shopify_stores ALTER COLUMN access_token DROP NOT NULL;
ALTER TABLE shopify_stores ALTER COLUMN webhook_secret DROP NOT NULL;
