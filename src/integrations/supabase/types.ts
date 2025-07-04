Need to install the following packages:
supabase@2.26.9
Ok to proceed? (y) 
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
      admin_notes: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          note: string
          read: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          note: string
          read?: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          note?: string
          read?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_files: {
        Row: {
          ai_match_results: Json | null
          broker_id: string | null
          created_at: string | null
          extracted_summary: string | null
          file_name: string | null
          file_type: string | null
          file_url: string
          file_url_path: string | null
          id: string
        }
        Insert: {
          ai_match_results?: Json | null
          broker_id?: string | null
          created_at?: string | null
          extracted_summary?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url: string
          file_url_path?: string | null
          id?: string
        }
        Update: {
          ai_match_results?: Json | null
          broker_id?: string | null
          created_at?: string | null
          extracted_summary?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string
          file_url_path?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_files_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_preferences: {
        Row: {
          approval_speed: string | null
          broker_id: string
          client_profile: Json | null
          created_at: string | null
          id: string
          loan_types: string[] | null
          max_amount: number | null
          min_amount: number | null
          states: string[] | null
          updated_at: string | null
        }
        Insert: {
          approval_speed?: string | null
          broker_id: string
          client_profile?: Json | null
          created_at?: string | null
          id?: string
          loan_types?: string[] | null
          max_amount?: number | null
          min_amount?: number | null
          states?: string[] | null
          updated_at?: string | null
        }
        Update: {
          approval_speed?: string | null
          broker_id?: string
          client_profile?: Json | null
          created_at?: string | null
          id?: string
          loan_types?: string[] | null
          max_amount?: number | null
          min_amount?: number | null
          states?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broker_preferences_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      brokers: {
        Row: {
          agency_name: string | null
          client_notes: string | null
          created_at: string | null
          id: string
          profile_completed: boolean | null
          profile_id: string | null
          subscription_tier: string | null
        }
        Insert: {
          agency_name?: string | null
          client_notes?: string | null
          created_at?: string | null
          id: string
          profile_completed?: boolean | null
          profile_id?: string | null
          subscription_tier?: string | null
        }
        Update: {
          agency_name?: string | null
          client_notes?: string | null
          created_at?: string | null
          id?: string
          profile_completed?: boolean | null
          profile_id?: string | null
          subscription_tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brokers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brokers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      file_summaries: {
        Row: {
          broker_file_id: string | null
          created_at: string | null
          extracted_data: Json | null
          id: string
          lender_file_id: string | null
          match_ready: boolean | null
          summary_text: string | null
          updated_at: string | null
        }
        Insert: {
          broker_file_id?: string | null
          created_at?: string | null
          extracted_data?: Json | null
          id?: string
          lender_file_id?: string | null
          match_ready?: boolean | null
          summary_text?: string | null
          updated_at?: string | null
        }
        Update: {
          broker_file_id?: string | null
          created_at?: string | null
          extracted_data?: Json | null
          id?: string
          lender_file_id?: string | null
          match_ready?: boolean | null
          summary_text?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_summaries_broker_file_id_fkey"
            columns: ["broker_file_id"]
            isOneToOne: false
            referencedRelation: "broker_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_summaries_lender_file_id_fkey"
            columns: ["lender_file_id"]
            isOneToOne: false
            referencedRelation: "lender_files"
            referencedColumns: ["id"]
          },
        ]
      }
      lender_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_type: string | null
          file_url: string
          file_url_path: string
          id: string
          lender_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_type?: string | null
          file_url: string
          file_url_path: string
          id?: string
          lender_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_type?: string | null
          file_url?: string
          file_url_path?: string
          id?: string
          lender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lender_files_lender_id_fkey"
            columns: ["lender_id"]
            isOneToOne: false
            referencedRelation: "lenders"
            referencedColumns: ["id"]
          },
        ]
      }
      lender_guidelines: {
        Row: {
          approval_speed: string | null
          client_requirements: Json | null
          created_at: string | null
          description: string | null
          id: string
          lender_id: string
          loan_types: string[] | null
          max_amount: number | null
          min_amount: number | null
          name: string
          states: string[] | null
          updated_at: string | null
        }
        Insert: {
          approval_speed?: string | null
          client_requirements?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          lender_id: string
          loan_types?: string[] | null
          max_amount?: number | null
          min_amount?: number | null
          name: string
          states?: string[] | null
          updated_at?: string | null
        }
        Update: {
          approval_speed?: string | null
          client_requirements?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          lender_id?: string
          loan_types?: string[] | null
          max_amount?: number | null
          min_amount?: number | null
          name?: string
          states?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lender_guidelines_lender_id_fkey"
            columns: ["lender_id"]
            isOneToOne: false
            referencedRelation: "lenders"
            referencedColumns: ["id"]
          },
        ]
      }
      lenders: {
        Row: {
          company_name: string | null
          contact_info: string | null
          created_at: string | null
          criteria_summary: string | null
          guideline_file_url: string | null
          id: string
          profile_completed: boolean | null
          profile_id: string | null
          specialization: string | null
        }
        Insert: {
          company_name?: string | null
          contact_info?: string | null
          created_at?: string | null
          criteria_summary?: string | null
          guideline_file_url?: string | null
          id: string
          profile_completed?: boolean | null
          profile_id?: string | null
          specialization?: string | null
        }
        Update: {
          company_name?: string | null
          contact_info?: string | null
          created_at?: string | null
          criteria_summary?: string | null
          guideline_file_url?: string | null
          id?: string
          profile_completed?: boolean | null
          profile_id?: string | null
          specialization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lenders_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lenders_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          broker_file_id: string | null
          broker_id: string | null
          created_at: string | null
          id: string
          lender_file_id: string | null
          lender_guideline_id: string | null
          lender_id: string | null
          match_data: Json | null
          match_summary: string | null
          score: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          broker_file_id?: string | null
          broker_id?: string | null
          created_at?: string | null
          id?: string
          lender_file_id?: string | null
          lender_guideline_id?: string | null
          lender_id?: string | null
          match_data?: Json | null
          match_summary?: string | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          broker_file_id?: string | null
          broker_id?: string | null
          created_at?: string | null
          id?: string
          lender_file_id?: string | null
          lender_guideline_id?: string | null
          lender_id?: string | null
          match_data?: Json | null
          match_summary?: string | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_broker_file_id_fkey"
            columns: ["broker_file_id"]
            isOneToOne: false
            referencedRelation: "broker_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_lender_file_id_fkey"
            columns: ["lender_file_id"]
            isOneToOne: false
            referencedRelation: "lender_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_lender_guideline_id_fkey"
            columns: ["lender_guideline_id"]
            isOneToOne: false
            referencedRelation: "lender_guidelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_lender_id_fkey"
            columns: ["lender_id"]
            isOneToOne: false
            referencedRelation: "lenders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          role: string
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id: string
          role: string
        }
        Update: {
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_roles: {
        Row: {
          id: string | null
          role: string | null
        }
        Insert: {
          id?: string | null
          role?: string | null
        }
        Update: {
          id?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_user_everywhere: {
        Args: { uid: string }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
