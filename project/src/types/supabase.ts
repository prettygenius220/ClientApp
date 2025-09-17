export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      todo_folders: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          user_id: string
          shared_with: string[] | null
          can_edit: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          user_id: string
          shared_with?: string[] | null
          can_edit?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          user_id?: string
          shared_with?: string[] | null
          can_edit?: string[] | null
        }
      }
      todo_profiles: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          role: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
          role?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          role?: string
        }
      }
      todos: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          is_complete: boolean
          user_id: string
          folder_id: string | null
          shared_with: string[] | null
          can_edit: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          is_complete?: boolean
          user_id: string
          folder_id?: string | null
          shared_with?: string[] | null
          can_edit?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          is_complete?: boolean
          user_id?: string
          folder_id?: string | null
          shared_with?: string[] | null
          can_edit?: string[] | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      issue_external_certificate: {
        Args: {
          p_course_id: string
          p_email: string
          p_first_name: string
          p_last_name: string
          p_ce_hours: number
        }
        Returns: string
      }
      reissue_certificate: {
        Args: {
          certificate_id: string
        }
        Returns: void
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    Tables: {
      password_reset_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          expires_at: string
          used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          expires_at: string
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          expires_at?: string
          used?: boolean
          created_at?: string
        }
      }
      magic_link_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          expires_at: string
          used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          expires_at: string
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          expires_at?: string
          used?: boolean
          created_at?: string
        }
      }
      // ... existing tables
    }
  }
}