-- ============================================================
-- LOCK — migration 029: artist-controlled WhatsApp sharing
-- ============================================================
-- Owner ruling (9 Jul 2026): the ARTIST decides, in personal-details settings,
-- whether a booking manager may reach them on WhatsApp after sending a request.
-- whatsapp_number is a firewall-private column (016) and must NEVER be exposed by
-- a public SELECT. So sharing is opt-in + gated by a SECURITY DEFINER function
-- that returns the number ONLY when the artist published AND opted in.
--
-- Safe to apply anytime; the app degrades gracefully before it is applied (the
-- request screen simply shows no WhatsApp CTA, exactly as today).

alter table public.artists
  add column if not exists whatsapp_share boolean not null default false;

comment on column public.artists.whatsapp_share is
  'Artist opt-in: expose whatsapp_number to a booking manager after a request. Default false. Read ONLY via get_shared_whatsapp().';

-- Gated read: returns the number iff published + opted-in + present, else NULL.
-- SECURITY DEFINER so an anonymous requester can reach it without a direct
-- (firewall-blocked) SELECT on artists.whatsapp_number.
create or replace function public.get_shared_whatsapp(p_artist_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select whatsapp_number
  from public.artists
  where id = p_artist_id
    and published = true
    and whatsapp_share = true
    and whatsapp_number is not null
    and length(btrim(whatsapp_number)) > 0
$$;

grant execute on function public.get_shared_whatsapp(uuid) to anon, authenticated;
