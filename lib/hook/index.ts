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
