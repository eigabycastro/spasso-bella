-- =====================================================================
-- Spasso Bella MG — fotos da galeria (Sprint 07)
-- Bucket público: qualquer pessoa vê as fotos do site;
-- só a administradora envia, troca ou apaga.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('galeria', 'galeria', true)
on conflict (id) do nothing;

create policy "admin envia fotos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'galeria' and public.is_admin());

create policy "admin atualiza fotos" on storage.objects
  for update to authenticated
  using (bucket_id = 'galeria' and public.is_admin());

create policy "admin apaga fotos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'galeria' and public.is_admin());
