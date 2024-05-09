import { Twilio } from "twilio";
import { HookdeckClient } from "@hookdeck/sdk";

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const hookdeckApiKey = process.env.HOOKDECK_API_KEY;
const hookdeckSigningSecret = process.env.HOOKDECK_SIGNING_SECRET;
const phoneNumbers = process.env.NEXT_PUBLIC_PHONE_NUMBERS;

if (
  !twilioAccountSid || !twilioAuthToken || !hookdeckApiKey ||
  !hookdeckSigningSecret || !phoneNumbers
) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const log = (...args: any[]) => {
  console.log.apply(console, ["🪝 ", ...args]);
  console.log();
};

const twilioClient = new Twilio(twilioAccountSid, twilioAuthToken);
const hookdeckClient = new HookdeckClient({
  token: hookdeckApiKey!,
});

const setup = async () => {
  // Create Hookdeck connection and get Source URL
  const connection = await hookdeckClient.connection.upsert({
    name: "sms-voting",
    source: {
      name: "twilio-messaging",
    },
    destination: {
      name: "mock",
      url: "https://mock.hookdeck.com",
    },
  });

  log(
    "Created or updated Connection. Source URL:",
    connection.source.url,
  );

  const smsCallbackUrl = `${connection.source.url}/webhooks/vote`;

  // For each Twilio phone number from the .env file,
  // update the SMS callback URL to use the Hookdeck URL + /webhooks/vote
  const numbers = phoneNumbers.split(",");

  for (const number of numbers) {
    const registeredNumbers = await twilioClient.incomingPhoneNumbers
      .list({ phoneNumber: number });

    log(
      `Got registed number "${number}" with SMS callback URL "${
        registeredNumbers[0].smsUrl
      }"`,
    );

    if (registeredNumbers[0].smsUrl === smsCallbackUrl) {
      log(
        `SMS callback URL is already set to "${smsCallbackUrl}". Skipping update.`,
      );
      continue;
    }

    log(`Updated SMS callback URL to use "${smsCallbackUrl}"`);

    await twilioClient.incomingPhoneNumbers(registeredNumbers[0].sid)
      .update({
        smsMethod: "POST",
        smsUrl: smsCallbackUrl,
      });

    log(`Updated SMS callback URL for number "${number}"`);
  }
};

setup().then(() => {
  log("Setup complete!");
}).catch((error) => {
  console.error("An error occurred during setup:", error);
});
