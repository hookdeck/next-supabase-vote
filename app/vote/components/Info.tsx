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
    </div>
  );
}
