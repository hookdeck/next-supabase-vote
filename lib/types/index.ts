export type IVoteLog = {
  vote_id: string;
  user_id: string;
  id: string;
  option: string;
  created_at: string;
};

export type IVote = {
  created_at: string;
  created_by: string;
  description?: string | null;
  end_date: string;
  id: string;
  title: string;
  phone_number?: string | null;
};

export type IComment = {
  created_at: string;
  id: string;
  text: string;
  send_by: string;
  vote_id: string;
  is_edit: boolean;
  users: {
    avatar_url: string | null;
    created_at: string;
    id: string;
    user_name: string | null;
  } | null;
};

export interface IVoteOption {
  position: number;
  vote_count: number;
}

export interface IVoteOptions {
  [key: string]: IVoteOption;
}
