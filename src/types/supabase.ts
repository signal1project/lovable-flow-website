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
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          note: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          note?: string
        }
        Relationships: []
      }
      broker_files: {
        Row: {
          ai_match_results: Json | null
          broker_id: string | null
          created_at: string | null
          extracted_summary: string | null
          file_type: string | null
          file_url: string
          id: string
        }
        Insert: {
          ai_match_results?: Json | null
          broker_id?: string | null
          created_at?: string | null
          extracted_summary?: string | null
          file_type?: string | null
          file_url: string
          id?: string
        }
        Update: {
          ai_match_results?: Json | null
          broker_id?: string | null
          created_at?: string | null
          extracted_summary?: string | null
          file_type?: string | null
          file_url?: string
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
      brokers: {
        Row: {
          agency_name: string | null
          client_notes: string | null
          created_at: string | null
          id: string
          profile_id: string | null
          subscription_tier: string | null
        }
        Insert: {
          agency_name?: string | null
          client_notes?: string | null
          created_at?: string | null
          id: string
          profile_id?: string | null
          subscription_tier?: string | null
        }
        Update: {
          agency_name?: string | null
          client_notes?: string | null
          created_at?: string | null
          id?: string
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
      lenders: {
        Row: {
          company_name: string | null
          contact_info: string | null
          created_at: string | null
          criteria_summary: string | null
          guideline_file_url: string | null
          id: string
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
