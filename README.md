# SupaPoll

A live poll Next.js application built with Supabase, Twilio, and Hookdeck.

<img width="1299" alt="Screenshot 2023-12-13 at 6 11 26 PM" src="https://github.com/Chensokheng/next-supabase-vote/assets/52232579/614c6d64-80f1-43ee-a5fb-288f27b581da">

## Setup

1. [Signup for Supabase](https://supabase.com/dashboard/sign-up).
2. [Install the Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) and login with `supabase login`
3. Create a new Supabase project using the Supabase CLI and enter details as prompted:
   ```bash
   supabase projects create
   ```
4. Open the project URL and add the appropriate values to a `.env` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SERVICE_ROLE=
   ```
5. Link your Supabase project locally by running `supabase link`, selecting the project, and entering the database password you used when running `supabase projects create`.
6. Run `supabase db push` to run the migrations on the remote database.
7. Set up GitHub Login for the project by following the [Supabase GitHub login guide](https://supabase.com/docs/guides/auth/social-login/auth-github)
8. Set up Twilio Verify by following the [Twilio Verify Supabase phone provider guide](https://supabase.com/docs/guides/auth/phone-login/twilio#twilio-verify)

## Run SupaPoll

```bash
npm i
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) with your browser to see the result.

## Learn More

To learn more about the technologies used in this application:

- [Supabase](https://supabase.com?ref=github-supapoll)
- [Twilio Verify](https://www.twilio.com/docs/verify?ref=github-supapoll)
- [Twilio Programmable Messaging](https://www.twilio.com/docs/messaging?ref=github-supapoll)
- [Hookdeck](https://hookdeck.com?ref=github-supapoll)
- [Next.js](https://nextjs.org?ref=github-supapoll)

## Credits

- [Daily Web Coding](https://www.patreon.com/dailywebcoding)
