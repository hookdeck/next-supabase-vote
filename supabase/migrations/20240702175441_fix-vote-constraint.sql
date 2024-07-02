DROP POLICY IF EXISTS view_own_profile_data ON "public"."profile";

create policy "Enable read access for all users"
on "public"."profile"
to public
using (
  true
);