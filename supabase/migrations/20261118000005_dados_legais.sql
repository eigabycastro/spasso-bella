-- =====================================================================
-- Spasso Bella MG — dados legais do studio (LGPD / Decreto 7.962/2013)
-- Nome empresarial, CNPJ (ou CPF, se ainda não for MEI) e e-mail de contato
-- para assuntos de privacidade. Aparecem no rodapé e nas políticas do site.
-- Leitura pública já coberta pela regra "site le dados do studio".
-- =====================================================================

alter table public.business_settings
  add column legal_name    text,
  add column document_id   text,  -- CNPJ ou CPF, como deve aparecer no site
  add column contact_email text check (contact_email is null or contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
