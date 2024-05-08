import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@hookdeck/sdk/webhooks/helpers";
import { toStoredPhoneNumberFormat } from "@/lib/utils";
import createSupabaseServerAdmin from "@/lib/supabase/admin";

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

  // 2. Check which poll is associated with the "to" phone number
  const voteNumber = toStoredPhoneNumberFormat(body.To);

  const { data: voterPoll, error: voteError } = await supabase
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

  console.log("found voterPoll", voterPoll);

  // 3. Validate the vote option
  const { data: voteOptions, error: voteOptionsError } = await supabase
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

  const options = voteOptions.options as VoteOptions;
  const votedForOption = body.Body.trim().replace("#", "");

  if (!options || !options[votedForOption]) {
    return new NextResponse(
      JSON.stringify({
        error:
          `Error: could not find vote option sent in the body of the SMS message: "${votedForOption}" for poll with id "${voterPoll.id}"`,
      }),
      { status: 404 },
    );
  }

  // 4. Add the user's vote to the poll
  const { error } = await supabase.rpc("update_vote", {
    update_id: voterPoll.id,
    option: votedForOption,
  });

  if (error) {
    return new NextResponse(
      JSON.stringify({
        error:
          `Error: could not update the vote: "${votedForOption}" for poll with id "${voterPoll.id}"`,
      }),
      { status: 500 },
    );
  }

  return NextResponse.json({ vote_success: true });
}
