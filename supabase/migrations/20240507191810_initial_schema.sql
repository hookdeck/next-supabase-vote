SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE SCHEMA IF NOT EXISTS "public";

ALTER SCHEMA "public" OWNER TO "pg_database_owner";

CREATE EXTENSION IF NOT EXISTS moddatetime
	SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."check_update_comment"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  IF new.created_at != old.created_at THEN
    RAISE exception 'You can not update created at!';

  ELSE
    new.is_edit = true;
    return new;
  END IF;
END$$;

ALTER FUNCTION "public"."check_update_comment"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."check_vote_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  IF new.created_at != old.created_at THEN
    RAISE exception 'You can not update created at!';

  ELSE
    return new;
  END IF;
END$$;

ALTER FUNCTION "public"."check_vote_update"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_user_on_signup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    INSERT INTO public.users (id,user_name,avatar_url,phone)
    VALUES (
      NEW.id,
      new.raw_user_meta_data ->>'user_name',
      new.raw_user_meta_data ->>'avatar_url'
      new.phone
    );
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."create_user_on_signup"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_vote"("options" "jsonb", "title" "text", "end_date" timestamp without time zone, "description" "text", "phone_number" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  return_id uuid;
  options_count INT;
  key_value_type text;
BEGIN

  SELECT COUNT(*) INTO options_count
  FROM jsonb_object_keys(options);

  IF options_count <= 1 THEN
    RAISE EXCEPTION 'Options must have more than one key.';
  END IF;

   -- Check if all values associated with keys are numbers
  SELECT jsonb_typeof(value) INTO key_value_type
  FROM jsonb_each(options)
  WHERE NOT jsonb_typeof(value) IN ('number');

  IF key_value_type IS NOT NULL THEN
    RAISE EXCEPTION 'All values in options must be numbers.';
  END IF;

  INSERT INTO vote (created_by, title, end_date, description, phone_number)
  VALUES (auth.uid(),title, end_date, description, phone_number)
  RETURNING id INTO return_id;

  INSERT INTO vote_options (vote_id,options)
  VALUES (return_id, options);
  return return_id;
END $$;

ALTER FUNCTION "public"."create_vote"("options" "jsonb", "title" "text", "end_date" timestamp without time zone, "description" "text", "phone_number" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_vote_log"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$  BEGIN
    INSERT INTO public.voted (vote_id,user_id)
    VALUES (
      old.vote_id,
      auth.uid()
    );
    RETURN NEW;
END;

$$;

ALTER FUNCTION "public"."create_vote_log"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."vote" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "description" "text",
    "phone_number" "text",
    CONSTRAINT "vote_created_at_check" CHECK (("created_at" <= "now"())),
    CONSTRAINT "vote_end_date_check" CHECK ((("end_date" <= ("now"() + '7 days'::interval)) AND ("end_date" > "now"())))
);

ALTER TABLE "public"."vote" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."vote_log" (
    "vote_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "option" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."vote_log" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."vote_options" (
    "vote_id" "uuid" NOT NULL,
    "options" "jsonb" NOT NULL
);

ALTER TABLE "public"."vote_options" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_vote"("target_vote" "uuid") RETURNS TABLE("vote_columns" "public"."vote", "vote_options_columns" "public"."vote_options", "vote_log_columns" "public"."vote_log")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT vote.*, vote_options.*, vote_log.*
    FROM vote
    JOIN vote_options ON vote.id = vote_options.vote_id
    JOIN vote_log ON vote.id = vote_log.vote_id
    WHERE vote.id = target_vote
      AND vote_log.user_id = auth.uid();
END;
$$;

ALTER FUNCTION "public"."get_vote"("target_vote" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profile (id, email, full_name, avatar_url, phone)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.phone);
  return new;
end;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle_updated_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  update public.profile
  set email = new.email,
      full_name = new.raw_user_meta_data->>'full_name',
      avatar_url = new.raw_user_meta_data->>'avatar_url',
      phone = new.phone
  where id = new.id;
  return new;
end;
$$;

ALTER FUNCTION "public"."handle_updated_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."is_expired"("vote_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
return exists(SELECT 1
FROM vote where end_date < now() and id = vote_id);
end;$$;

ALTER FUNCTION "public"."is_expired"("vote_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."is_voted"("target_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  return exists(select 1 from vote_log where user_id = auth.uid() and vote_log.vote_id=target_id);
end;$$;

ALTER FUNCTION "public"."is_voted"("target_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_vote"("update_id" "uuid", "option" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  updated_count INT;
BEGIN
  UPDATE vote_options
  SET options = options || jsonb_build_object(option, (options ->> option)::int + 5)
  WHERE vote_id = update_id and NOT is_expired(update_id) and  NOT is_voted(update_id) and options ? option
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

ALTER FUNCTION "public"."update_vote"("update_id" "uuid", "option" "text") OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."comments" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "text" "text" NOT NULL,
    "send_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "vote_id" "uuid" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "is_edit" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."comments" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."profile" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "email" character varying(255),
    "full_name" "text",
    "avatar_url" "text",
    "phone" "text"
);

ALTER TABLE "public"."profile" OWNER TO "postgres";

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."vote_options"
    ADD CONSTRAINT "vote_options_pkey" PRIMARY KEY ("vote_id");

ALTER TABLE ONLY "public"."vote"
    ADD CONSTRAINT "vote_phone_number_key" UNIQUE ("phone_number");

ALTER TABLE ONLY "public"."vote"
    ADD CONSTRAINT "vote_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."vote_log"
    ADD CONSTRAINT "voted_pkey" PRIMARY KEY ("id");

CREATE OR REPLACE TRIGGER "_100_handle_updated_at" BEFORE UPDATE ON "public"."profile" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');

create or replace trigger _100_on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace trigger _100_on_auth_user_updated
after update on auth.users
for each row
when (old . * is distinct from new . *)
execute procedure public.handle_updated_user();

CREATE OR REPLACE TRIGGER "check_update_comment" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."check_update_comment"();

CREATE OR REPLACE TRIGGER "check_update_vote" BEFORE UPDATE ON "public"."vote" FOR EACH ROW EXECUTE FUNCTION "public"."check_vote_update"();

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "public"."vote"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "public_comments_send_by_fkey" FOREIGN KEY ("send_by") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."vote"
    ADD CONSTRAINT "public_vote_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."vote_log"
    ADD CONSTRAINT "vote_log_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "public"."vote"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY "public"."vote_options"
    ADD CONSTRAINT "vote_options_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "public"."vote"("id") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE POLICY "Enable delete for users based on user_id" ON "public"."comments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "send_by"));

CREATE POLICY "Enable delete for users based on user_id" ON "public"."vote" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "created_by"));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."comments" FOR INSERT TO "authenticated" WITH CHECK ((("created_at" = "now"()) AND ("auth"."uid"() = "send_by") AND (NOT "public"."is_expired"("vote_id"))));

CREATE POLICY "Enable read access for all users" ON "public"."comments" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."vote" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."vote_log" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Enable read access for all users" ON "public"."vote_options" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable update for users based on email" ON "public"."comments" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "send_by")) WITH CHECK (("auth"."uid"() = "send_by"));

CREATE POLICY "Enable update for users based on email" ON "public"."vote" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "created_by")) WITH CHECK (("auth"."uid"() = "created_by"));

ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profile" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "update_own_profile_data" ON "public"."profile" FOR UPDATE USING (("auth"."uid"() = "id"));

CREATE POLICY "view_own_profile_data" ON "public"."profile" FOR SELECT USING (("auth"."uid"() = "id"));

ALTER TABLE "public"."vote" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."vote_log" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."vote_options" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

REVOKE ALL ON FUNCTION "public"."check_update_comment"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."check_update_comment"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_update_comment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_update_comment"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."check_vote_update"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."check_vote_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_vote_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_vote_update"() TO "service_role";

GRANT ALL ON FUNCTION "public"."create_user_on_signup"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_on_signup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_on_signup"() TO "service_role";

GRANT ALL ON FUNCTION "public"."create_vote"("options" "jsonb", "title" "text", "end_date" timestamp without time zone, "description" "text", "phone_number" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_vote"("options" "jsonb", "title" "text", "end_date" timestamp without time zone, "description" "text", "phone_number" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_vote"("options" "jsonb", "title" "text", "end_date" timestamp without time zone, "description" "text", "phone_number" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."create_vote_log"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_vote_log"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_vote_log"() TO "service_role";

GRANT ALL ON TABLE "public"."vote" TO "anon";
GRANT ALL ON TABLE "public"."vote" TO "authenticated";
GRANT ALL ON TABLE "public"."vote" TO "service_role";

GRANT ALL ON TABLE "public"."vote_log" TO "anon";
GRANT ALL ON TABLE "public"."vote_log" TO "authenticated";
GRANT ALL ON TABLE "public"."vote_log" TO "service_role";

GRANT ALL ON TABLE "public"."vote_options" TO "anon";
GRANT ALL ON TABLE "public"."vote_options" TO "authenticated";
GRANT ALL ON TABLE "public"."vote_options" TO "service_role";

REVOKE ALL ON FUNCTION "public"."get_vote"("target_vote" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_vote"("target_vote" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_vote"("target_vote" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_vote"("target_vote" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."handle_updated_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_user"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."is_expired"("vote_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_expired"("vote_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_expired"("vote_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_expired"("vote_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."is_voted"("target_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_voted"("target_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_voted"("target_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."update_vote"("update_id" "uuid", "option" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_vote"("update_id" "uuid", "option" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_vote"("update_id" "uuid", "option" "text") TO "service_role";

GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";

GRANT ALL ON TABLE "public"."profile" TO "anon";
GRANT ALL ON TABLE "public"."profile" TO "authenticated";
GRANT ALL ON TABLE "public"."profile" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
