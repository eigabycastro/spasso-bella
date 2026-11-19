-- =====================================================================
-- Spasso Bella MG — mensagens de WhatsApp (envio manual assistido)
-- - Guarda quando a confirmação e o lembrete foram enviados, para a
--   profissional não mandar duas vezes nem esquecer ninguém.
-- - Textos das mensagens editáveis em Configurações.
-- O envio continua pelo link wa.me (a profissional toca em "enviar").
-- =====================================================================

alter table public.appointments
  add column confirmation_sent_at timestamptz,
  add column reminder_sent_at     timestamptz;

-- { "confirmation": "...", "reminder": "...", "birthday": "..." }
-- Vazio = textos padrão definidos no app (src/utils/whatsappMessages.ts)
alter table public.business_settings
  add column message_templates jsonb not null default '{}'::jsonb;
