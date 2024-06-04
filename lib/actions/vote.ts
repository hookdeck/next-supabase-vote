"use server";

import { redirect } from "next/navigation";
import createSupabaseServer from "../supabase/server";
import { revalidatePath } from "next/cache";
import { IVoteOptions } from "../types";
import { Json } from "../types/supabase";

export async function listActiveVotes() {
  const supabase = await createSupabaseServer();

  return supabase
    .from("vote")
    .select("*")
    .filter("end_date", "gte", new Date().toISOString())
    .order("created_at", { ascending: true });
}

export async function listExpiredVotes() {
  const supabase = await createSupabaseServer();

  return supabase
    .from("vote")
    .select("*")
    .filter("end_date", "lte", new Date().toISOString())
    .order("created_at", { ascending: true });
}

export async function createVote(data: {
  vote_options: IVoteOptions;
  end_date: Date;
  title: string;
  description?: string;
  phone_number: string;
}) {
  const supabase = await createSupabaseServer();

  const { data: voteId, error } = await supabase.rpc("create_vote", {
    options: data.vote_options as any,
    title: data.title,
    end_date: new Date(data.end_date).toISOString(),
    description: data.description || "",
    phone_number: data.phone_number || undefined,
  });

  if (error) {
    throw "Fail to create vote." + error.message;
  } else {
    redirect("/vote/" + voteId);
  }
}

export async function updateVotePath(id: string) {
  revalidatePath("/vote/" + id);
}

export async function getVoteById(id: string) {
  const supabase = await createSupabaseServer();
  return await supabase.from("vote").select("*").eq("id", id).single();
}

export async function updateVoteById(
  data: {
    end_date: Date;
    description?: string;
    title: string;
    phone_number: string;
  },
  voteId: string,
) {
  const supabase = await createSupabaseServer();
  const { error, data: vote } = await supabase
    .from("vote")
    .update({
      title: data.title,
      end_date: data.end_date.toISOString(),
      description: data.description,
      phone_number: data.phone_number,
    })
    .eq("id", voteId);
  if (error) {
    throw error.message;
  }
  revalidatePath("/vote/" + voteId);
  return redirect("/vote/" + voteId);
}
