-- =====================================================================
-- Spasso Bella MG — salvar atendimento de uma vez (Sprint 04)
-- Cria (p_id nulo) ou edita um atendimento junto com seus serviços,
-- numa única transação: ou salva tudo, ou nada.
-- - Copia nome, preço e duração atuais de cada serviço.
-- - Calcula o fim somando as durações (ou usa p_end_at, se enviado).
-- - Horário ocupado: erro com a mensagem 'HORARIO_OCUPADO'.
-- =====================================================================

create or replace function public.save_appointment(
  p_client_id   uuid,
  p_start_at    timestamptz,
  p_service_ids uuid[],
  p_notes       text default null,
  p_id          uuid default null,
  p_end_at      timestamptz default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id       uuid;
  v_duration integer;
begin
  if not public.is_admin() then
    raise exception 'Acesso não autorizado';
  end if;

  if p_service_ids is null or cardinality(p_service_ids) = 0 then
    raise exception 'Escolha pelo menos um serviço';
  end if;

  select coalesce(sum(s.duration_min), 0)
    into v_duration
    from unnest(p_service_ids) as sid
    join public.services s on s.id = sid;

  if v_duration = 0 then
    raise exception 'Serviço não encontrado';
  end if;

  begin
    if p_id is null then
      insert into public.appointments (client_id, start_at, end_at, notes)
      values (p_client_id, p_start_at,
              coalesce(p_end_at, p_start_at + make_interval(mins => v_duration)),
              p_notes)
      returning id into v_id;
    else
      update public.appointments
         set client_id = p_client_id,
             start_at  = p_start_at,
             end_at    = coalesce(p_end_at, p_start_at + make_interval(mins => v_duration)),
             notes     = p_notes
       where id = p_id
      returning id into v_id;

      if v_id is null then
        raise exception 'Atendimento não encontrado';
      end if;

      delete from public.appointment_items where appointment_id = v_id;
    end if;
  exception
    when exclusion_violation then
      raise exception 'HORARIO_OCUPADO';
  end;

  insert into public.appointment_items (appointment_id, service_id, service_name, price, duration_min)
  select v_id, s.id, s.name, s.price, s.duration_min
    from unnest(p_service_ids) with ordinality as x(sid, ord)
    join public.services s on s.id = x.sid
   order by x.ord;

  return v_id;
end;
$$;

revoke execute on function public.save_appointment from public, anon;
grant execute on function public.save_appointment to authenticated;
