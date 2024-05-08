"use client";
import React from "react";
import dynamic from "next/dynamic";
import { IVote } from "@/lib/types";
import { toDisplayedPhoneNumberFormat } from "@/lib/utils";

const TimeCountDown = dynamic(() => import("./TimeCountDown"), { ssr: false });

export default function Info({ vote }: { vote: IVote }) {
  const tomorrow = new Date(vote.end_date);
  tomorrow.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-3 w-full">
      <h2 className="text-3xl font-bold break-words">{vote.title}</h2>
      <TimeCountDown targetDate={tomorrow} />
      {vote.phone_number && (
        <div className="mt-12 text-2xl ">
          Vote by sending an SMS:{" "}
          <span className="bg-zinc-600 p-1">#choice</span> to{" "}
          <span className="font-extrabold">
            {toDisplayedPhoneNumberFormat(vote.phone_number)}
          </span>
        </div>
      )}
    </div>
  );
}
