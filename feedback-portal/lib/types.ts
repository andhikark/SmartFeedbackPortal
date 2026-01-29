// Database Types
export type Database = {
  public: {
    Tables: {
      feedback: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: string | null;
          priority: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category?: string | null;
          priority?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          category?: string | null;
          priority?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Application Types
export type Feedback = Database['public']['Tables']['feedback']['Row'];
export type FeedbackInsert = Database['public']['Tables']['feedback']['Insert'];
export type FeedbackUpdate = Database['public']['Tables']['feedback']['Update'];

export type FeedbackStatus = 'Pending' | 'Processed' | 'Reviewed' | 'Resolved';
export type FeedbackPriority = 'High' | 'Medium' | 'Low';
export type FeedbackCategory = 'Bug' | 'Feature' | 'General' | 'Urgent';

// Form Types
export interface FeedbackFormData {
  title: string;
  description: string;
}

// UI State Types
export interface ToastMessage {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}
