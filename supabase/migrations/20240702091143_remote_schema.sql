alter table "public"."vote" drop constraint "vote_phone_number_key";

drop index if exists "public"."vote_phone_number_key";

alter table "public"."vote" add constraint "vote_created_by_fkey" FOREIGN KEY (created_by) REFERENCES profile(id) not valid;

alter table "public"."vote" validate constraint "vote_created_by_fkey";


