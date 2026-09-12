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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      classrooms: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          teacher_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          teacher_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          teacher_id?: string
        }
        Relationships: []
      }
      game_configs: {
        Row: {
          created_at: string
          game_id: string
          id: string
          is_active: boolean
          name: string
          settings: Json
          share_slug: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          is_active?: boolean
          name: string
          settings?: Json
          share_slug?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          is_active?: boolean
          name?: string
          settings?: Json
          share_slug?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          completed_at: string | null
          config_id: string | null
          game_type: string
          id: string
          score: number | null
          started_at: string | null
          student_id: string
          topic: string
          total_questions: number | null
        }
        Insert: {
          completed_at?: string | null
          config_id?: string | null
          game_type: string
          id?: string
          score?: number | null
          started_at?: string | null
          student_id: string
          topic: string
          total_questions?: number | null
        }
        Update: {
          completed_at?: string | null
          config_id?: string | null
          game_type?: string
          id?: string
          score?: number | null
          started_at?: string | null
          student_id?: string
          topic?: string
          total_questions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_details: {
        Row: {
          attempts: number | null
          correct_answer: string | null
          id: string
          is_correct: boolean
          prompt: string
          selected_answer: string | null
          session_id: string
          time_taken_ms: number
        }
        Insert: {
          attempts?: number | null
          correct_answer?: string | null
          id?: string
          is_correct: boolean
          prompt: string
          selected_answer?: string | null
          session_id: string
          time_taken_ms: number
        }
        Update: {
          attempts?: number | null
          correct_answer?: string | null
          id?: string
          is_correct?: boolean
          prompt?: string
          selected_answer?: string | null
          session_id?: string
          time_taken_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "session_details_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          classroom_id: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          classroom_id: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          classroom_id?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      student_gamification: {
        Row: {
          created_at: string
          id: string
          inventory: Json
          quests: Json
          srs_deck: Json
          streak_state: Json
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory?: Json
          quests?: Json
          srs_deck?: Json
          streak_state?: Json
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory?: Json
          quests?: Json
          srs_deck?: Json
          streak_state?: Json
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_gamification_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      word_bank: {
        Row: {
          cefr_level: string
          created_at: string
          created_by: string | null
          distractors: string[]
          emoji: string | null
          english: string
          example_sentence: string | null
          example_translation: string | null
          id: string
          is_system: boolean
          part_of_speech: string
          phonetic: string | null
          topic: string
          updated_at: string
          vietnamese: string
        }
        Insert: {
          cefr_level?: string
          created_at?: string
          created_by?: string | null
          distractors?: string[]
          emoji?: string | null
          english: string
          example_sentence?: string | null
          example_translation?: string | null
          id?: string
          is_system?: boolean
          part_of_speech?: string
          phonetic?: string | null
          topic?: string
          updated_at?: string
          vietnamese: string
        }
        Update: {
          cefr_level?: string
          created_at?: string
          created_by?: string | null
          distractors?: string[]
          emoji?: string | null
          english?: string
          example_sentence?: string | null
          example_translation?: string | null
          id?: string
          is_system?: boolean
          part_of_speech?: string
          phonetic?: string | null
          topic?: string
          updated_at?: string
          vietnamese?: string
        }
        Relationships: []
      }
      live_arenas: {
        Row: {
          config_id: string | null
          created_at: string
          current_question_index: number
          game_id: string
          id: string
          is_active: boolean
          pin_code: string
          questions: Json
          round_started_at: string | null
          status: string
          teacher_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          config_id?: string | null
          created_at?: string
          current_question_index?: number
          game_id?: string
          id?: string
          is_active?: boolean
          pin_code: string
          questions?: Json
          round_started_at?: string | null
          status?: string
          teacher_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          config_id?: string | null
          created_at?: string
          current_question_index?: number
          game_id?: string
          id?: string
          is_active?: boolean
          pin_code?: string
          questions?: Json
          round_started_at?: string | null
          status?: string
          teacher_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_arenas_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "game_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      live_arena_participants: {
        Row: {
          answers: Json
          arena_id: string
          avatar: string
          class_code: string | null
          created_at: string
          id: string
          score: number
          streak: number
          student_name: string
          updated_at: string
        }
        Insert: {
          answers?: Json
          arena_id: string
          avatar?: string
          class_code?: string | null
          created_at?: string
          id?: string
          score?: number
          streak?: number
          student_name: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          arena_id?: string
          avatar?: string
          class_code?: string | null
          created_at?: string
          id?: string
          score?: number
          streak?: number
          student_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_arena_participants_arena_id_fkey"
            columns: ["arena_id"]
            isOneToOne: false
            referencedRelation: "live_arenas"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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

export type StudentGamificationRow = Tables<'student_gamification'>
export type WordBankRow = Tables<'word_bank'>
export type WordBankInsert = TablesInsert<'word_bank'>
export type WordBankUpdate = TablesUpdate<'word_bank'>
