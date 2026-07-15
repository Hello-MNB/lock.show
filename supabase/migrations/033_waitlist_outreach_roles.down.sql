-- 033 down — restores the original (026) role check. Rows created with the new
-- values would violate it, so this down is only valid before such rows exist.
alter table public.waitlist_signup drop constraint if exists waitlist_signup_role_check;
alter table public.waitlist_signup add constraint waitlist_signup_role_check
  check (role is null or role in ('artist','booking_manager','producer','other'));
