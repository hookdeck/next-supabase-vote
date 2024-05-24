import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Footer from "../components/Footer";
import Navbar from "@/components/nav/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/components/QueryProvider";
import Config from "@/config";

const inter = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://next-supabase-vote.vercel.app/"),

  title: {
    template: `%s | ${Config.siteName}`,
    default: Config.siteName,
  },
  authors: Config.authors.map((author) => {
    return {
      name: author,
    };
  }),

  description: Config.siteDescription,
  openGraph: {
    title: Config.siteName,
    description: Config.siteDescription,
    url: Config.siteUrl,
    siteName: Config.siteName,
    images: "/og.png",
    type: "website",
  },
  keywords: Config.keywords,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-[#09090B] text-gray-200 antialiased  py-10`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <main className="flex flex-col max-w-7xl mx-auto min-h-screen space-y-10 p-5">
              <Navbar />
              <div className="w-full flex-1 ">{children}</div>
              <Footer />
            </main>
          </QueryProvider>

          <Toaster position="top-center" reverseOrder={false} />
        </ThemeProvider>
      </body>
    </html>
  );
}
