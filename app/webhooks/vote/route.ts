import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@hookdeck/sdk/webhooks/helpers";
import { toStoredPhoneNumberFormat } from "@/lib/utils";
import createSupabaseServerAdmin from "@/lib/supabase/admin";
import { IVoteOptions } from "@/lib/types";
import { createSigner } from "fast-jwt";
import { createClient } from "@supabase/supabase-js";

interface TwilioMessagingBody {
  ToCountry: string;
  ToState: string;
  SmsMessageSid: string;
  NumMedia: string;
  ToCity: string;
  FromZip: string;
  SmsSid: string;
  FromState: string;
  SmsStatus: string;
  FromCity: string;
  Body: string;
  FromCountry: string;
  To: string;
  ToZip: string;
  NumSegments: string;
  MessageSid: string;
  AccountSid: string;
  From: string;
  ApiVersion: string;
}

const signer = createSigner({
  key: process.env.SUPABASE_JWT_SECRET,
  algorithm: "HS256",
});

export function createSupabaseToken(userEmail: string, userId: string) {
  const ONE_HOUR = 60 * 60;
  const exp = Math.round(Date.now() / 1000) + ONE_HOUR;
  const payload = {
    aud: "authenticated",
    exp,
    sub: userId,
    email: userEmail,
    role: "authenticated",
  };
  return signer(payload);
}

export async function POST(request: Request) {
  const headers: { [key: string]: string } = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const rawBody = await request.text();

  const verificationResult = await verifyWebhookSignature({
    headers,
    rawBody,
    signingSecret: process.env.HOOKDECK_SIGNING_SECRET!,
    config: { checkSourceVerification: true },
  });

  if (!verificationResult.isValidSignature) {
    return new NextResponse(
      JSON.stringify({ error: "Could not verify the webhook signature" }),
      { status: 401 },
    );
  }

  const body: TwilioMessagingBody = JSON.parse(rawBody);

  const supabase = await createSupabaseServerAdmin();

  // Lookup:
  // 1. Find the user with the inbound "from" phone number
  // Supabase Auth strips the "+" prefix from the phone number
  const from = toStoredPhoneNumberFormat(body.From).replace("+", "");

  const { data: voter, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("phone", from)
    .single();

  if (profileError) {
    return new NextResponse(
      JSON.stringify({
        error:
          "Error: could not find a user with the provided 'from' phone number",
      }),
      { status: 404 },
    );
  }

  console.log("Found profile", voter);

  const token = createSupabaseToken(
    voter.email as string,
    voter.id,
  );

  const authenticatedClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
  // can be used normally with RLS!
  const user = await authenticatedClient.auth.getUser();
  console.log("Mapped to user", user);

  // 2. Check which poll is associated with the "to" phone number
  const voteNumber = toStoredPhoneNumberFormat(body.To);

  const { data: voterPoll, error: voteError } = await authenticatedClient
    .from("vote")
    .select("*")
    .eq("phone_number", voteNumber)
    .single();

  if (voteError) {
    return new NextResponse(
      JSON.stringify({
        error:
          "Error: could not find a poll with the provided 'to' phone number",
      }),
      { status: 404 },
    );
  }

  console.log("Found voterPoll", voterPoll);

  // 3. Validate the vote option
  const { data: voteOptions, error: voteOptionsError } =
    await authenticatedClient
      .from("vote_options")
      .select("options")
      .eq("vote_id", voterPoll.id)
      .single();

  if (voteOptionsError) {
    console.error(voteOptionsError);

    return new NextResponse(
      JSON.stringify({
        error:
          `Error: could not find vote options for the poll with a poll with id "${voterPoll.id}"`,
      }),
      { status: 404 },
    );
  }

  const options = voteOptions.options as unknown as IVoteOptions;
  const votedForOption = body.Body.trim().replace("#", "");

  console.log("options", options);

  let selectedOptionText = null;
  const optionKeys = Object.keys(options);
  for (let i = 0; i < optionKeys.length; ++i) {
    const key = optionKeys[i];
    if (Number(options[key].position) === Number(votedForOption)) {
      console.log("Found matching option", key, options[key]);
      selectedOptionText = key;
      break;
    }
  }

  if (!options || !selectedOptionText) {
    return new NextResponse(
      JSON.stringify({
        error:
          `Error: could not find vote option sent in the body of the SMS message: "${votedForOption}" for poll with id "${voterPoll.id}"`,
      }),
      { status: 404 },
    );
  }

  // 4. Add the user's vote to the poll
  const { error, data } = await authenticatedClient.rpc("update_vote", {
    update_id: voterPoll.id,
    option: selectedOptionText,
  });

  if (error) {
    const errorMessage =
      `Error: could not update the vote: "${votedForOption}" for poll with id "${voterPoll.id}"`;
    console.error(errorMessage, error);

    return new NextResponse(
      JSON.stringify({
        error: errorMessage,
      }),
      { status: 500 },
    );
  }

  console.log("Updated vote", data);

  return NextResponse.json({ vote_success: true });
}
