# SupaPoll

A live poll Next.js application built with Supabase, Twilio, and Hookdeck.

https://github.com/hookdeck/supapoll/assets/328367/b5171342-1d0b-4bdc-8d00-540907ebe571

[supapoll.com](https://supapoll.com) is deployed to [Vercel](https://vercel.com).

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
   SUPABASE_JWT_SECRET=
   ```

5. Link your Supabase project locally by running `supabase link`, selecting the project, and entering the database password you used when running `supabase projects create`.
6. Run `supabase db push` to run the migrations on the remote database.
7. Set up GitHub Login for the project by following the [Supabase GitHub login guide](https://supabase.com/docs/guides/auth/social-login/auth-github)
8. Set up Twilio Verify by following the [Twilio Verify Supabase phone provider guide](https://supabase.com/docs/guides/auth/phone-login/twilio#twilio-verify)
9. Set the Twilio environment variables:
   ```
   TWILIO_ACCOUNT_SID=
   TWILIO_AUTH_TOKEN=
   TWILIO_AUTH_VERIFY_SID=
   ```
10. Buy at least one phone number from Twilio to allow you to vote via SMS.
11. Update the environmental variable with one or more comma-separated phone numbers:
    ```
    NEXT_PUBLIC_PHONE_NUMBERS=
    ```
12. [Signup for Hookdeck](https://dashboard.hookdeck.com/signup?ref=github-supapoll), grab your project's API Key and signing secret from the [secrets section](https://dashboard.hookdeck.com/settings/project/secrets?ref=github-supapoll), and add the following environment variables:
    ```
    HOOKDECK_API_KEY=
    HOOKDECK_SIGNING_SECRET=
    ```
13. Install the application dependencies:
    ```
    npm i
    ```
14. Run the Hookdeck setup script to create a connection in Hookdeck to receive Twilio SMS webhooks and updated the Twilio phone numbers to use that URL for inbound SMS webhooks:
    ```
    npm run setup
    ```

## Run SupaPoll

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) with your browser to see the result.

## Development

To update the Supabase type definitions, run:

```bash
npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > lib/types/supabase.ts
```

See the Supabase docs for [Generating TypeScript Types](https://supabase.com/docs/guides/api/rest/generating-types).

## Learn More

To learn more about the technologies used in this application:

- [Supabase](https://supabase.com?ref=github-supapoll)
- [Twilio Verify](https://www.twilio.com/docs/verify?ref=github-supapoll)
- [Twilio Programmable Messaging](https://www.twilio.com/docs/messaging?ref=github-supapoll)
- [Hookdeck](https://hookdeck.com?ref=github-supapoll)
- [Next.js](https://nextjs.org?ref=github-supapoll)

## Credits

- [Daily Web Coding](https://www.patreon.com/dailywebcoding)
