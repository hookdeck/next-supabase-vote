alter table "public"."vote" drop constraint "vote_created_by_fkey";

alter table "public"."vote" add constraint "public_vote_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."vote" validate constraint "public_vote_created_by_fkey";


