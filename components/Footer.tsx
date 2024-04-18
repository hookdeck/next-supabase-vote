import React from "react";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { SiYoutube } from "react-icons/si";
import Link from "next/link";
export default function Footer() {
  return (
    <footer className=" border-t-[0.5px] py-10 flex items-center justify-center flex-col gap-5">
      <div className="flex items-center gap-2">
        <Link href="https://github.com/hookdeck/supapoll" target="_blank">
          <GitHubLogoIcon className="w-5 h-5 hover:scale-125 transition-all" />
        </Link>
      </div>
      <h1 className="text-sm">
        Made with 🫶 by{" "}
        <Link href="https://www.chensokheng.com/?ref=supapoll">
          Chensokheng
        </Link>{" "}
        &amp; <Link href="https://hookdeck.com?ref=supapoll">Hookdeck</Link>
      </h1>
    </footer>
  );
}
