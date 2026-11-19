-- =====================================================================
-- Spasso Bella MG — galeria: administradora pode listar os arquivos (Sprint 07)
-- O Storage exige permissão de SELECT em storage.objects para apagar ou
-- substituir arquivos. Sem esta regra, "Remover foto" falha no painel.
-- As fotos continuam públicas para o site (bucket público), como antes.
-- =====================================================================

create policy "admin le fotos" on storage.objects
  for select to authenticated
  using (bucket_id = 'galeria' and public.is_admin());
