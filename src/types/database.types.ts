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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'student' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          role?: 'student' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'student' | 'admin'
          updated_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string
          updated_at?: string
        }
      }
      chapters: {
        Row: {
          id: string
          class_id: string
          title: string
          content: string
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          class_id: string
          title: string
          content: string
          order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          content?: string
          order?: number
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          class_id: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          created_at?: string
        }
        Update: {
          student_id?: string
          class_id?: string
        }
      }
    }
  }
}
