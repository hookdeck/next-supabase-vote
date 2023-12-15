import { useQuery } from "@tanstack/react-query";
import { createSupabaseBrower } from "../supabase/client";
import toast from "react-hot-toast";
import { sortObject } from "../utils";

export function useGetVote(id: string) {
	const supabase = createSupabaseBrower();

	return useQuery({
		queryKey: ["vote-" + id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("vote")
				.select("*,vote_options(*),vote_log(*)")
				.eq("id", id)
				.single();

			if (error) {
				toast.error("Fail to fetch vote. " + error.message);
			}
			const voteOptions = sortObject(
				data?.vote_options?.options as { [key: string]: number }
			);
			const totalVote = Object.values(voteOptions).reduce(
				(acc, value) => acc + value,
				0
			);

			return {
				voteOptions,
				totalVote,
				voteLog: data?.vote_log[0],
				isExpired: data?.end_date! < new Date().toISOString(),
			};
		},
	});
}

export function useUser() {
	const supabase = createSupabaseBrower();

	return useQuery({
		queryKey: ["user"],
		queryFn: () => supabase.auth.getUser(),
	});
}