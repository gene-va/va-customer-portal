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
          client_service_id: string;
          title: string;
          status: 'draft' | 'published' | 'archived';
          phase: 'review' | 'outreach';
          campaign_type: 'event' | 'general';
          event_name: string | null;
          report_data: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          client_service_id: string;
          title: string;
          status?: 'draft' | 'published' | 'archived';
          phase?: 'review' | 'outreach';
          campaign_type?: 'event' | 'general';
          event_name?: string | null;
          report_data?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          client_service_id?: string;
          title?: string;
          status?: 'draft' | 'published' | 'archived';
          phase?: 'review' | 'outreach';
          campaign_type?: 'event' | 'general';
          event_name?: string | null;
          report_data?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
      };
      client_services: {
        Row: {
          id: string;
          client_id: string;
          service_type: 'asset_matching' | 'investment_matching' | 'market_access' | 'other';
          requirements_data: Record<string, unknown>;
          requirements_updated_at: string | null;
          active: boolean;
          is_primary: boolean;
          started_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          service_type: 'asset_matching' | 'investment_matching' | 'market_access' | 'other';
          requirements_data?: Record<string, unknown>;
          requirements_updated_at?: string | null;
          active?: boolean;
          is_primary?: boolean;
          started_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          service_type?: 'asset_matching' | 'investment_matching' | 'market_access' | 'other';
          requirements_data?: Record<string, unknown>;
          requirements_updated_at?: string | null;
          active?: boolean;
          is_primary?: boolean;
          started_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      investor_annotations: {
        Row: {
          id: string;
          report_id: string;
          investor_name: string;
          status: 'pursue' | 'already_known' | 'skip';
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          investor_name: string;
          status: 'pursue' | 'already_known' | 'skip';
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          investor_name?: string;
          status?: 'pursue' | 'already_known' | 'skip';
          note?: string | null;
          created_at?: string;
          updated_at?: string;
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
