import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { createSupabaseBrowser } from "../supabase/client";
import {
  sortVoteOptionsBy,
  toDisplayedPhoneNumberFormat,
  toStoredPhoneNumberFormat,
} from "../utils";
import { IComment } from "../types";

export function useGetVote(id: string) {
  const supabase = createSupabaseBrowser();

  return useQuery({
    queryKey: ["vote-" + id],
    queryFn: async () => {
      const { data } = await supabase
        .from("vote")
        .select("*,vote_options(*),vote_log(*)")
        .eq("id", id)
        .single();

      const voteOptions = sortVoteOptionsBy(
        data?.vote_options?.options as any,
      );
      const totalVote = Object.values(voteOptions).reduce(
        (acc, value) => acc + value.vote_count,
        0,
      );

      return {
        voteOptions,
        totalVote,
        voteLog: data?.vote_log[0],
        isExpired: data?.end_date! < new Date().toISOString(),
      };
    },
    staleTime: Infinity,
  });
}

export function useUser() {
  const supabase = createSupabaseBrowser();
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return { user: data.session?.user };
    },
    staleTime: Infinity,
  });
}

export function useComment(voteId: string) {
  const supabase = createSupabaseBrowser();

  return useQuery({
    queryKey: ["vote-comment-" + voteId],
    queryFn: async () => {
      return [] as IComment[];
    },
    staleTime: Infinity,
  });
}

const configuredPhoneNumbers = process.env.NEXT_PUBLIC_PHONE_NUMBERS
  ? process.env.NEXT_PUBLIC_PHONE_NUMBERS.split(",")
  : [];

export type FormattedNumber = {
  e164: string;
  displayNumber: string;
};

export function useAvailablePhoneNumbers(): UseQueryResult<
  FormattedNumber[]
> {
  const supabase = createSupabaseBrowser();

  return useQuery({
    queryKey: ["available-phone-numbers"],
    queryFn: async () => {
      // Get phone numbers used in all active polls
      const { error, data } = await supabase
        .from("vote")
        .select("phone_number")
        .filter("end_date", "gte", new Date().toISOString());

      if (error) {
        console.error(error);
        throw new Error("Failed to fetch phone numbers");
      }
      const usedPhoneNumbers = data.map((row) => row.phone_number);
      const availableNumbers = configuredPhoneNumbers
        .filter((tel) => !usedPhoneNumbers.includes(tel))
        .map((tel) => {
          return {
            e164: toStoredPhoneNumberFormat(tel),
            displayNumber: toDisplayedPhoneNumberFormat(tel),
          };
        });

      return availableNumbers;
    },
  });
}
