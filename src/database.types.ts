export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      contest_admins: {
        Row: {
          contest_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          contest_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          contest_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_admins_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contests: {
        Row: {
          channel: string
          guild_id: string | null
          id: string
          leaderboard_channel: string
        }
        Insert: {
          channel: string
          guild_id?: string | null
          id?: string
          leaderboard_channel: string
        }
        Update: {
          channel?: string
          guild_id?: string | null
          id?: string
          leaderboard_channel?: string
        }
        Relationships: [
          {
            foreignKeyName: "contests_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          activation_password: string
          active: boolean
          created_at: string
          data_channel: string | null
          data_gathering_channel: string | null
          edited_at: string
          guild_owner: string
          id: string
          last_edited_by: string | null
          logs_channel: string | null
        }
        Insert: {
          activation_password?: string
          active?: boolean
          created_at?: string
          data_channel?: string | null
          data_gathering_channel?: string | null
          edited_at?: string
          guild_owner: string
          id: string
          last_edited_by?: string | null
          logs_channel?: string | null
        }
        Update: {
          activation_password?: string
          active?: boolean
          created_at?: string
          data_channel?: string | null
          data_gathering_channel?: string | null
          edited_at?: string
          guild_owner?: string
          id?: string
          last_edited_by?: string | null
          logs_channel?: string | null
        }
        Relationships: []
      }
      postal_codes: {
        Row: {
          city_name: string | null
          county_name: string | null
          is_valid: boolean
          last_checked: string
          postal_code: string
          state_abb: string | null
          state_name: string | null
        }
        Insert: {
          city_name?: string | null
          county_name?: string | null
          is_valid: boolean
          last_checked?: string
          postal_code: string
          state_abb?: string | null
          state_name?: string | null
        }
        Update: {
          city_name?: string | null
          county_name?: string | null
          is_valid?: boolean
          last_checked?: string
          postal_code?: string
          state_abb?: string | null
          state_name?: string | null
        }
        Relationships: []
      }
      routing_numbers: {
        Row: {
          city: string | null
          institution_name: string | null
          is_valid: boolean | null
          last_checked: string | null
          routing_number: string
          state: string | null
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          institution_name?: string | null
          is_valid?: boolean | null
          last_checked?: string | null
          routing_number: string
          state?: string | null
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          institution_name?: string | null
          is_valid?: boolean | null
          last_checked?: string | null
          routing_number?: string
          state?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      trackers: {
        Row: {
          answered_dials: number
          created_at: string
          dials: number
          edited_at: string
          id: string
          presentations_with_sale: number
          presentations_without_sale: number
          referrals: number
          sales: number
          user: string
        }
        Insert: {
          answered_dials?: number
          created_at?: string
          dials?: number
          edited_at?: string
          id?: string
          presentations_with_sale?: number
          presentations_without_sale?: number
          referrals?: number
          sales?: number
          user: string
        }
        Update: {
          answered_dials?: number
          created_at?: string
          dials?: number
          edited_at?: string
          id?: string
          presentations_with_sale?: number
          presentations_without_sale?: number
          referrals?: number
          sales?: number
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "trackers_user_fkey"
            columns: ["user"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      universal_settings: {
        Row: {
          setting: string
          value: string
        }
        Insert: {
          setting: string
          value: string
        }
        Update: {
          setting?: string
          value?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          agent_number: string
          competition_wins: number
          created_at: string
          guild_id: string
          id: string
          is_admin: boolean
          user_id: string
        }
        Insert: {
          agent_number?: string
          competition_wins?: number
          created_at?: string
          guild_id: string
          id?: string
          is_admin?: boolean
          user_id: string
        }
        Update: {
          agent_number?: string
          competition_wins?: number
          created_at?: string
          guild_id?: string
          id?: string
          is_admin?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
