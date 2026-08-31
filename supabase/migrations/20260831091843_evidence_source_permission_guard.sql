-- R14 / APP00 case20: persisted source permission gates dependent use.
-- Forward-only amendment of the existing RPC; no historical migration edits,
-- data rewrites, new endpoint, grant, or user-facing revocation operation.
-- Fail closed if the installed function is not the exact reviewed predecessor.
DO $migration$
DECLARE
  definition text;
  body text;
  anchor constant text := '  select * into act_row from public.act where id=subject_act for update;';
  addition constant text := $guard$
  -- R14 source permission: current state governs dependent use, including replay.
  -- Keep the existing Act -> evidence row lock order through the entire commit.
  if action in ('prepare','propose') then
    select * into ev from public.evidence_artifacts
      where id=object_id and artist_id=a and act_id=subject_act for update;
    if ev.id is null or ev.source_owner_consent is distinct from true then
      raise exception 'denied';
    end if;
  end if;$guard$;
BEGIN
  SELECT replace(pg_get_functiondef(p.oid), E'\r\n', E'\n'),
         replace(p.prosrc, E'\r\n', E'\n')
    INTO STRICT definition, body
    FROM pg_proc p WHERE p.oid='public.commit_evidence_action(jsonb)'::regprocedure;
  IF md5(body)='8373650a0d94cd30d9e327f23b69191b' THEN
    RETURN; -- Already applied; do not implicitly re-enable a rolled-back API.
  END IF;
  IF md5(body)<>'64e738534f6dabaf890a2ec088ca81bf'
    OR (length(body)-length(replace(body,anchor,'')))/length(anchor)<>1 THEN
    RAISE EXCEPTION 'source_permission_guard_predecessor_mismatch';
  END IF;
  EXECUTE replace(definition, anchor, anchor || addition);
  IF (SELECT md5(replace(prosrc, E'\r\n', E'\n')) FROM pg_proc
      WHERE oid='public.commit_evidence_action(jsonb)'::regprocedure)<>'8373650a0d94cd30d9e327f23b69191b' THEN
    RAISE EXCEPTION 'source_permission_guard_readback_mismatch';
  END IF;
END;
$migration$;
