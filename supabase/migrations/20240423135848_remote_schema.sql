alter table "public"."comments" drop constraint "comments_send_by_fkey";

alter table "public"."comments" add constraint "public_comments_send_by_fkey" FOREIGN KEY (send_by) REFERENCES auth.users(id) not valid;

alter table "public"."comments" validate constraint "public_comments_send_by_fkey";


