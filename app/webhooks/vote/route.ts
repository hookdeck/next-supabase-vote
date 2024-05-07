import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@hookdeck/sdk/webhooks/helpers";

export async function POST(request: Request) {
  const headers: { [key: string]: string } = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const verificationResult = await verifyWebhookSignature({
    headers,
    rawBody: await request.text(),
    signingSecret: process.env.HOOKDECK_SIGNING_SECRET!,
    config: { checkSourceVerification: true },
  });

  if (!verificationResult.isValidSignature) {
    return new NextResponse(
      JSON.stringify({ error: "Could not verify the webhook signature" }),
      { status: 401 },
    );
  }
  const body = await request.json();
  console.log(body);

  // Lookup:
  // 1. Find the user with the inbound "from" phone number
  // 2. Check which poll is associated with the "to" phone number
  // 3. Add the user's vote to the poll

  return NextResponse.json({ received: true });
}
