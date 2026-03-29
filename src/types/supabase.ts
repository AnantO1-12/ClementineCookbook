export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          title: string;
          slug: string;
          description: string | null;
          category: string | null;
          cuisine: string | null;
          prep_time: number | null;
          cook_time: number | null;
          servings: number | null;
          ingredients: Json;
          instructions: Json;
          notes: string | null;
          image_url: string | null;
          is_favorite: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          title: string;
          slug: string;
          description?: string | null;
          category?: string | null;
          cuisine?: string | null;
          prep_time?: number | null;
          cook_time?: number | null;
          servings?: number | null;
          ingredients?: Json;
          instructions?: Json;
          notes?: string | null;
          image_url?: string | null;
          is_favorite?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          category?: string | null;
          cuisine?: string | null;
          prep_time?: number | null;
          cook_time?: number | null;
          servings?: number | null;
          ingredients?: Json;
          instructions?: Json;
          notes?: string | null;
          image_url?: string | null;
          is_favorite?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
