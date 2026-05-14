export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// This file mirrors the shape produced by `supabase gen types typescript`.
// Keep it in sync with your schema when columns change.
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id:                   string;
          email:                string;
          full_name:            string | null;
          role:                 Database["public"]["Enums"]["member_role"];
          phone:                string | null;
          reminder_time:        string | null;
          reminder_preference:  Database["public"]["Enums"]["reminder_preference"] | null;
          created_at:           string;
          updated_at:           string;
        };
        Insert: {
          id:                   string;
          email:                string;
          full_name?:           string | null;
          role?:                Database["public"]["Enums"]["member_role"];
          phone?:               string | null;
          reminder_time?:       string | null;
          reminder_preference?: Database["public"]["Enums"]["reminder_preference"] | null;
          created_at?:          string;
          updated_at?:          string;
        };
        Update: {
          id?:                  string;
          email?:               string;
          full_name?:           string | null;
          role?:                Database["public"]["Enums"]["member_role"];
          phone?:               string | null;
          reminder_time?:       string | null;
          reminder_preference?: Database["public"]["Enums"]["reminder_preference"] | null;
          updated_at?:          string;
        };
        Relationships: [];
      };
      check_ins: {
        Row: {
          id:             string;
          member_id:      string;
          check_in_date:  string;          // YYYY-MM-DD, UTC
          checked_in_at:  string;
          notes:          string | null;
          created_at:     string;
        };
        Insert: {
          id?:             string;
          member_id:       string;
          check_in_date?:  string;
          checked_in_at?:  string;
          notes?:          string | null;
          created_at?:     string;
        };
        Update: {
          id?:             string;
          member_id?:      string;
          check_in_date?:  string;
          checked_in_at?:  string;
          notes?:          string | null;
        };
        Relationships: [
          {
            foreignKeyName: "check_ins_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      milestones: {
        Row: {
          id:                 string;
          name:               string;
          description:        string;
          required_check_ins: number;
          badge_url:          string | null;
          created_at:         string;
          updated_at:         string;
        };
        Insert: {
          id?:                string;
          name:               string;
          description:        string;
          required_check_ins: number;
          badge_url?:         string | null;
          created_at?:        string;
          updated_at?:        string;
        };
        Update: {
          id?:                 string;
          name?:               string;
          description?:        string;
          required_check_ins?: number;
          badge_url?:          string | null;
          updated_at?:         string;
        };
        Relationships: [];
      };
      member_milestones: {
        Row: {
          id:           string;
          member_id:    string;
          milestone_id: string;
          earned_at:    string;
        };
        Insert: {
          id?:          string;
          member_id:    string;
          milestone_id: string;
          earned_at?:   string;
        };
        Update: {
          id?:           string;
          member_id?:    string;
          milestone_id?: string;
          earned_at?:    string;
        };
        Relationships: [
          {
            foreignKeyName: "member_milestones_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "member_milestones_milestone_id_fkey";
            columns: ["milestone_id"];
            isOneToOne: false;
            referencedRelation: "milestones";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: { [_ in never]: never };
        Returns: boolean;
      };
    };
    Enums: {
      member_role:         "member" | "admin";
      reminder_preference: "email" | "sms" | "both";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
