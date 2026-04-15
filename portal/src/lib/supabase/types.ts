export type Database = {
  public: {
    Tables: {
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'client';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'admin' | 'client';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'admin' | 'client';
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string | null;
          company_name: string;
          contact_name: string | null;
          contact_email: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          company_name: string;
          contact_name?: string | null;
          contact_email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          company_name?: string;
          contact_name?: string | null;
          contact_email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          status: 'draft' | 'published' | 'archived';
          report_data: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          status?: 'draft' | 'published' | 'archived';
          report_data?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          status?: 'draft' | 'published' | 'archived';
          report_data?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
      };
      report_versions: {
        Row: {
          id: string;
          report_id: string;
          report_data: Record<string, unknown>;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          report_data: Record<string, unknown>;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          report_data?: Record<string, unknown>;
          created_by?: string;
          created_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          admin_user_id: string;
          action_type: string;
          target_table: string | null;
          target_id: string | null;
          details: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id: string;
          action_type: string;
          target_table?: string | null;
          target_id?: string | null;
          details?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_user_id?: string;
          action_type?: string;
          target_table?: string | null;
          target_id?: string | null;
          details?: Record<string, unknown>;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      update_updated_at_column: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: {};
  };
};
