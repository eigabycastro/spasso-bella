-- =====================================================================
-- Liberar a administradora (rodar UMA vez, depois das migrations)
--
-- Antes: Supabase > Authentication > Users > Add user > Create new user
--        (e-mail + senha, marcar "Auto Confirm User").
-- Depois: trocar o e-mail abaixo, colar no SQL Editor e clicar em Run.
--
-- Não é uma migration: o e-mail é dado pessoal e não deve ir para o Git
-- com valor real. Mantenha o placeholder neste arquivo.
-- =====================================================================

insert into public.admins (user_id)
select id
  from auth.users
 where email = lower('EMAIL_DA_ADMINISTRADORA@exemplo.com')
on conflict (user_id) do nothing
returning user_id;  -- deve mostrar 1 linha; se mostrar 0, o e-mail não existe em Authentication > Users
