alter table "public"."vote" add column "phone_number" text;

DROP FUNCTION IF EXISTS "public"."create_vote"(options jsonb, title text, end_date timestamp without time zone, description text);


CREATE OR REPLACE FUNCTION "public"."create_vote"("options" "jsonb", "title" "text", "end_date" timestamp without time zone, "description" "text", "phone_number" "text" DEFAULT NULL::"text") RETURNS "uuid"
   LANGUAGE "plpgsql" SECURITY DEFINER
   SET "search_path" TO 'public'
   AS $$
DECLARE
 return_id uuid;
 options_count INT;
 key_value_type text;
 position_value_type text;
 vote_count_value_type text;
BEGIN


 SELECT COUNT(*) INTO options_count
 FROM jsonb_object_keys(options);


 IF options_count <= 1 THEN
   RAISE EXCEPTION 'Options must have more than one key.';
 END IF;


  -- Check if all values associated with keys are objects
 SELECT jsonb_typeof(value) INTO key_value_type
 FROM jsonb_each(options)
 WHERE NOT jsonb_typeof(value) IN ('object');


 IF key_value_type IS NOT NULL THEN
   RAISE EXCEPTION 'All values in options must be objects.';
 END IF;


 -- Check if all positions are numbers
 SELECT jsonb_typeof(value) INTO position_value_type
 FROM jsonb_each(options::jsonb -> 'position')
 WHERE NOT jsonb_typeof(value) IN ('number');


 IF position_value_type IS NOT NULL THEN
   RAISE EXCEPTION 'All positions in options must be numbers.';
 END IF;


   -- Check if all vote_count are numbers
 SELECT jsonb_typeof(value) INTO vote_count_value_type
 FROM jsonb_each(options::jsonb -> 'vote_count')
 WHERE NOT jsonb_typeof(value) IN ('number');


 IF vote_count_value_type IS NOT NULL THEN
   RAISE EXCEPTION 'All vote_count in options must be numbers.';
 END IF;


 INSERT INTO vote (created_by, title, end_date, description, phone_number)
 VALUES (auth.uid(),title, end_date, description, phone_number)
 RETURNING id INTO return_id;


 INSERT INTO vote_options (vote_id,options)
 VALUES (return_id, options);
 return return_id;
END $$;