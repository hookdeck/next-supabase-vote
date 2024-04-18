const Config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL,
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "SupaPoll",
  siteDescription: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Cast your vote now and see live updates on the poll results, powered by Twilio, Hookdeck, and Supabase",
  keywords: process.env.NEXT_PUBLIC_KEYWORDS?.split(",") || ["daily web coding", "chensokheng", "hookdeck", "twilio", "supabase"],
  authors: process.env.NEXT_PUBLIC_AUTHORS?.split(",") || ["chensokheng", "leggetter"],
}

export default Config;