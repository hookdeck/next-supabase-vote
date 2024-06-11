export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      comments: {
        Row: {
          created_at: string
          id: string
          is_edit: boolean
          send_by: string
          text: string
          vote_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_edit?: boolean
          send_by?: string
          text: string
          vote_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_edit?: boolean
          send_by?: string
          text?: string
          vote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "vote"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_comments_send_by_fkey"
            columns: ["send_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vote: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          id: string
          phone_number: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          phone_number?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          phone_number?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_vote_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_log: {
        Row: {
          created_at: string
          id: string
          option: string
          user_id: string
          vote_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option: string
          user_id: string
          vote_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option?: string
          user_id?: string
          vote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_log_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: false
            referencedRelation: "vote"
            referencedColumns: ["id"]
          },
        ]
      }
      vote_options: {
        Row: {
          options: Json
          vote_id: string
        }
        Insert: {
          options: Json
          vote_id: string
        }
        Update: {
          options?: Json
          vote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_options_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: true
            referencedRelation: "vote"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_vote: {
        Args: {
          options: Json
          title: string
          end_date: string
          description: string
          phone_number?: string
        }
        Returns: string
      }
      get_vote: {
        Args: {
          target_vote: string
        }
        Returns: {
          vote_columns: unknown
          vote_options_columns: unknown
          vote_log_columns: unknown
        }[]
      }
      is_expired: {
        Args: {
          vote_id: string
        }
        Returns: boolean
      }
      is_voted: {
        Args: {
          target_id: string
        }
        Returns: boolean
      }
      update_vote: {
        Args: {
          update_id: string
          option: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
