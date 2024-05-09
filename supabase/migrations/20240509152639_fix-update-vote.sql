CREATE OR REPLACE FUNCTION "public"."update_vote"("update_id" "uuid", "option" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  updated_count INT;
BEGIN
  UPDATE vote_options 
  SET options = options || jsonb_set(
    options,
    ('{'||option||',vote_count}')::text[],
    (COALESCE(options[option]->>'vote_count','0')::int + 1)::text::jsonb
  )
  WHERE vote_id = update_id and NOT is_expired(update_id) and NOT is_voted(update_id) and options ? option
  RETURNING 1 INTO updated_count;

  IF updated_count > 0 THEN
    -- Update was successful, so insert into another table
    INSERT INTO vote_log (user_id,vote_id,option)
    VALUES (auth.uid(), update_id,option);
    RAISE NOTICE 'Update and insert successful';
  ELSE
    -- Update was not successful
    RAISE EXCEPTION 'Update not successful';
  END IF;
END $$;