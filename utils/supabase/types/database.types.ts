export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      analytics_daily: {
        Row: {
          browsers: Json | null;
          click_count: number;
          countries: Json | null;
          created_at: string | null;
          date: string;
          devices: Json | null;
          id: string;
          link_id: string;
          referrers: Json | null;
          unique_visitors: number;
          updated_at: string | null;
        };
        Insert: {
          browsers?: Json | null;
          click_count?: number;
          countries?: Json | null;
          created_at?: string | null;
          date: string;
          devices?: Json | null;
          id?: string;
          link_id: string;
          referrers?: Json | null;
          unique_visitors?: number;
          updated_at?: string | null;
        };
        Update: {
          browsers?: Json | null;
          click_count?: number;
          countries?: Json | null;
          created_at?: string | null;
          date?: string;
          devices?: Json | null;
          id?: string;
          link_id?: string;
          referrers?: Json | null;
          unique_visitors?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_daily_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
      analytics_monthly: {
        Row: {
          browsers: Json | null;
          click_count: number;
          countries: Json | null;
          created_at: string | null;
          devices: Json | null;
          end_date: string;
          id: string;
          link_id: string;
          referrers: Json | null;
          start_date: string;
          unique_visitors: number;
          updated_at: string | null;
          year_month: string;
        };
        Insert: {
          browsers?: Json | null;
          click_count?: number;
          countries?: Json | null;
          created_at?: string | null;
          devices?: Json | null;
          end_date: string;
          id?: string;
          link_id: string;
          referrers?: Json | null;
          start_date: string;
          unique_visitors?: number;
          updated_at?: string | null;
          year_month: string;
        };
        Update: {
          browsers?: Json | null;
          click_count?: number;
          countries?: Json | null;
          created_at?: string | null;
          devices?: Json | null;
          end_date?: string;
          id?: string;
          link_id?: string;
          referrers?: Json | null;
          start_date?: string;
          unique_visitors?: number;
          updated_at?: string | null;
          year_month?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_monthly_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
      analytics_weekly: {
        Row: {
          browsers: Json | null;
          click_count: number;
          countries: Json | null;
          created_at: string | null;
          devices: Json | null;
          end_date: string;
          id: string;
          link_id: string;
          referrers: Json | null;
          start_date: string;
          unique_visitors: number;
          updated_at: string | null;
          year_week: string;
        };
        Insert: {
          browsers?: Json | null;
          click_count?: number;
          countries?: Json | null;
          created_at?: string | null;
          devices?: Json | null;
          end_date: string;
          id?: string;
          link_id: string;
          referrers?: Json | null;
          start_date: string;
          unique_visitors?: number;
          updated_at?: string | null;
          year_week: string;
        };
        Update: {
          browsers?: Json | null;
          click_count?: number;
          countries?: Json | null;
          created_at?: string | null;
          devices?: Json | null;
          end_date?: string;
          id?: string;
          link_id?: string;
          referrers?: Json | null;
          start_date?: string;
          unique_visitors?: number;
          updated_at?: string | null;
          year_week?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_weekly_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
      bio_links: {
        Row: {
          bio_page_id: string;
          click_count: number | null;
          color: string | null;
          created_at: string | null;
          icon: string | null;
          id: string;
          is_visible: boolean | null;
          position: number | null;
          title: string;
          updated_at: string | null;
          url: string;
        };
        Insert: {
          bio_page_id: string;
          click_count?: number | null;
          color?: string | null;
          created_at?: string | null;
          icon?: string | null;
          id?: string;
          is_visible?: boolean | null;
          position?: number | null;
          title: string;
          updated_at?: string | null;
          url: string;
        };
        Update: {
          bio_page_id?: string;
          click_count?: number | null;
          color?: string | null;
          created_at?: string | null;
          icon?: string | null;
          id?: string;
          is_visible?: boolean | null;
          position?: number | null;
          title?: string;
          updated_at?: string | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bio_links_bio_page_id_fkey";
            columns: ["bio_page_id"];
            isOneToOne: false;
            referencedRelation: "bio_pages";
            referencedColumns: ["id"];
          },
        ];
      };
      bio_pages: {
        Row: {
          bio_text: string | null;
          created_at: string | null;
          custom_css: string | null;
          custom_domain: string | null;
          custom_js: string | null;
          id: string;
          is_published: boolean | null;
          meta_description: string | null;
          meta_title: string | null;
          og_image_url: string | null;
          organization_id: string;
          profile_image_url: string | null;
          slug: string;
          theme: string | null;
          title: string | null;
          updated_at: string | null;
          user_id: string;
          view_count: number | null;
        };
        Insert: {
          bio_text?: string | null;
          created_at?: string | null;
          custom_css?: string | null;
          custom_domain?: string | null;
          custom_js?: string | null;
          id?: string;
          is_published?: boolean | null;
          meta_description?: string | null;
          meta_title?: string | null;
          og_image_url?: string | null;
          organization_id: string;
          profile_image_url?: string | null;
          slug: string;
          theme?: string | null;
          title?: string | null;
          updated_at?: string | null;
          user_id: string;
          view_count?: number | null;
        };
        Update: {
          bio_text?: string | null;
          created_at?: string | null;
          custom_css?: string | null;
          custom_domain?: string | null;
          custom_js?: string | null;
          id?: string;
          is_published?: boolean | null;
          meta_description?: string | null;
          meta_title?: string | null;
          og_image_url?: string | null;
          organization_id?: string;
          profile_image_url?: string | null;
          slug?: string;
          theme?: string | null;
          title?: string | null;
          updated_at?: string | null;
          user_id?: string;
          view_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "bio_pages_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organization_metrics";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "bio_pages_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bio_pages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_activity";
            referencedColumns: ["user_id"];
          },
        ];
      };
      bio_social_links: {
        Row: {
          bio_page_id: string;
          created_at: string | null;
          display_text: string | null;
          icon: string | null;
          id: string;
          is_visible: boolean | null;
          platform: string;
          position: number | null;
          username: string;
        };
        Insert: {
          bio_page_id: string;
          created_at?: string | null;
          display_text?: string | null;
          icon?: string | null;
          id?: string;
          is_visible?: boolean | null;
          platform: string;
          position?: number | null;
          username: string;
        };
        Update: {
          bio_page_id?: string;
          created_at?: string | null;
          display_text?: string | null;
          icon?: string | null;
          id?: string;
          is_visible?: boolean | null;
          platform?: string;
          position?: number | null;
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bio_social_links_bio_page_id_fkey";
            columns: ["bio_page_id"];
            isOneToOne: false;
            referencedRelation: "bio_pages";
            referencedColumns: ["id"];
          },
        ];
      };
      campaign_links: {
        Row: {
          campaign_id: string;
          created_at: string | null;
          link_id: string;
        };
        Insert: {
          campaign_id: string;
          created_at?: string | null;
          link_id: string;
        };
        Update: {
          campaign_id?: string;
          created_at?: string | null;
          link_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaign_links_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaign_metrics";
            referencedColumns: ["campaign_id"];
          },
          {
            foreignKeyName: "campaign_links_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "campaign_links_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
      campaigns: {
        Row: {
          color: string | null;
          created_at: string | null;
          description: string | null;
          end_date: string | null;
          id: string;
          name: string;
          organization_id: string;
          start_date: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          name: string;
          organization_id: string;
          start_date?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          name?: string;
          organization_id?: string;
          start_date?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "campaigns_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organization_metrics";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "campaigns_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      clicks: {
        Row: {
          browser: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          device_type: string | null;
          fraud_reasons: Json | null;
          fraud_score: number | null;
          id: string;
          ip_address: string | null;
          is_suspicious: boolean | null;
          link_id: string;
          os: string | null;
          referrer: string | null;
          user_agent: string | null;
        };
        Insert: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Update: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id?: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      clicks_archive: {
        Row: {
          archived_at: string | null;
          browser: string | null;
          city: string | null;
          country: string | null;
          created_at: string | null;
          device_type: string | null;
          fraud_reasons: Json | null;
          fraud_score: number | null;
          id: string | null;
          ip_address: string | null;
          is_suspicious: boolean | null;
          link_id: string;
          os: string | null;
          referrer: string | null;
          user_agent: string | null;
        };
        Insert: {
          archived_at?: string | null;
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string | null;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Update: {
          archived_at?: string | null;
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string | null;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id?: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      clicks_y2025m05: {
        Row: {
          browser: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          device_type: string | null;
          fraud_reasons: Json | null;
          fraud_score: number | null;
          id: string;
          ip_address: string | null;
          is_suspicious: boolean | null;
          link_id: string;
          os: string | null;
          referrer: string | null;
          user_agent: string | null;
        };
        Insert: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Update: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id?: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_clicks_y2025m05_link_id";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
      clicks_y2025m06: {
        Row: {
          browser: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          device_type: string | null;
          fraud_reasons: Json | null;
          fraud_score: number | null;
          id: string;
          ip_address: string | null;
          is_suspicious: boolean | null;
          link_id: string;
          os: string | null;
          referrer: string | null;
          user_agent: string | null;
        };
        Insert: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Update: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id?: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_clicks_y2025m06_link_id";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
      clicks_y2025m07: {
        Row: {
          browser: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          device_type: string | null;
          fraud_reasons: Json | null;
          fraud_score: number | null;
          id: string;
          ip_address: string | null;
          is_suspicious: boolean | null;
          link_id: string;
          os: string | null;
          referrer: string | null;
          user_agent: string | null;
        };
        Insert: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Update: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id?: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_clicks_y2025m07_link_id";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
      clicks_y2025m08: {
        Row: {
          browser: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          device_type: string | null;
          fraud_reasons: Json | null;
          fraud_score: number | null;
          id: string;
          ip_address: string | null;
          is_suspicious: boolean | null;
          link_id: string;
          os: string | null;
          referrer: string | null;
          user_agent: string | null;
        };
        Insert: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Update: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id?: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_clicks_y2025m08_link_id";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
      clicks_y2025m09: {
        Row: {
          browser: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          device_type: string | null;
          fraud_reasons: Json | null;
          fraud_score: number | null;
          id: string;
          ip_address: string | null;
          is_suspicious: boolean | null;
          link_id: string;
          os: string | null;
          referrer: string | null;
          user_agent: string | null;
        };
        Insert: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Update: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id?: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_clicks_y2025m09_link_id";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
      clicks_y2025m10: {
        Row: {
          browser: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          device_type: string | null;
          fraud_reasons: Json | null;
          fraud_score: number | null;
          id: string;
          ip_address: string | null;
          is_suspicious: boolean | null;
          link_id: string;
          os: string | null;
          referrer: string | null;
          user_agent: string | null;
        };
        Insert: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Update: {
          browser?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          device_type?: string | null;
          fraud_reasons?: Json | null;
          fraud_score?: number | null;
          id?: string;
          ip_address?: string | null;
          is_suspicious?: boolean | null;
          link_id?: string;
          os?: string | null;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_clicks_y2025m10_link_id";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
      custom_domains: {
        Row: {
          created_at: string | null;
          id: string;
          is_verified: boolean | null;
          organization_id: string | null;
          subdomain: string;
          user_id: string;
          verification_code: string | null;
          verified_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_verified?: boolean | null;
          organization_id?: string | null;
          subdomain: string;
          user_id: string;
          verification_code?: string | null;
          verified_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_verified?: boolean | null;
          organization_id?: string | null;
          subdomain?: string;
          user_id?: string;
          verification_code?: string | null;
          verified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "custom_domains_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organization_metrics";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "custom_domains_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "custom_domains_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_activity";
            referencedColumns: ["user_id"];
          },
        ];
      };
      fraud_rules: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          organization_id: string;
          rule_config: Json;
          rule_type: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          organization_id: string;
          rule_config: Json;
          rule_type: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          organization_id?: string;
          rule_config?: Json;
          rule_type?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fraud_rules_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organization_metrics";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "fraud_rules_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      link_destinations: {
        Row: {
          click_count: number | null;
          created_at: string | null;
          destination_url: string;
          id: string;
          is_active: boolean | null;
          link_id: string;
          weight: number | null;
        };
        Insert: {
          click_count?: number | null;
          created_at?: string | null;
          destination_url: string;
          id?: string;
          is_active?: boolean | null;
          link_id: string;
          weight?: number | null;
        };
        Update: {
          click_count?: number | null;
          created_at?: string | null;
          destination_url?: string;
          id?: string;
          is_active?: boolean | null;
          link_id?: string;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "link_destinations_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
      link_metadata: {
        Row: {
          created_at: string | null;
          description: string | null;
          image_url: string | null;
          link_id: string;
          site_name: string | null;
          title: string | null;
          twitter_card: string | null;
          twitter_creator: string | null;
          twitter_site: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          image_url?: string | null;
          link_id: string;
          site_name?: string | null;
          title?: string | null;
          twitter_card?: string | null;
          twitter_creator?: string | null;
          twitter_site?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          image_url?: string | null;
          link_id?: string;
          site_name?: string | null;
          title?: string | null;
          twitter_card?: string | null;
          twitter_creator?: string | null;
          twitter_site?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "link_metadata_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: true;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
      link_pixels: {
        Row: {
          created_at: string | null;
          link_id: string;
          pixel_id: string;
        };
        Insert: {
          created_at?: string | null;
          link_id: string;
          pixel_id: string;
        };
        Update: {
          created_at?: string | null;
          link_id?: string;
          pixel_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "link_pixels_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "link_pixels_pixel_id_fkey";
            columns: ["pixel_id"];
            isOneToOne: false;
            referencedRelation: "pixels";
            referencedColumns: ["id"];
          },
        ];
      };
      link_rotation_rules: {
        Row: {
          created_at: string | null;
          destination_id: string;
          id: string;
          link_id: string;
          priority: number | null;
          rule_type: string;
          rule_value: Json;
        };
        Insert: {
          created_at?: string | null;
          destination_id: string;
          id?: string;
          link_id: string;
          priority?: number | null;
          rule_type: string;
          rule_value: Json;
        };
        Update: {
          created_at?: string | null;
          destination_id?: string;
          id?: string;
          link_id?: string;
          priority?: number | null;
          rule_type?: string;
          rule_value?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "link_rotation_rules_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "link_destinations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "link_rotation_rules_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
      link_tags: {
        Row: {
          link_id: string;
          tag_id: string;
        };
        Insert: {
          link_id: string;
          tag_id: string;
        };
        Update: {
          link_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "link_tags_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "link_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      links: {
        Row: {
          access_count: number | null;
          active_from: string | null;
          active_until: string | null;
          click_count: number | null;
          created_at: string | null;
          description: string | null;
          expires_at: string | null;
          fallback_url: string | null;
          id: string;
          is_active: boolean | null;
          is_password_protected: boolean | null;
          organization_id: string | null;
          original_url: string;
          password_hash: string | null;
          short_code: string;
          title: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          access_count?: number | null;
          active_from?: string | null;
          active_until?: string | null;
          click_count?: number | null;
          created_at?: string | null;
          description?: string | null;
          expires_at?: string | null;
          fallback_url?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_password_protected?: boolean | null;
          organization_id?: string | null;
          original_url: string;
          password_hash?: string | null;
          short_code: string;
          title?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          access_count?: number | null;
          active_from?: string | null;
          active_until?: string | null;
          click_count?: number | null;
          created_at?: string | null;
          description?: string | null;
          expires_at?: string | null;
          fallback_url?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_password_protected?: boolean | null;
          organization_id?: string | null;
          original_url?: string;
          password_hash?: string | null;
          short_code?: string;
          title?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "links_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organization_metrics";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "links_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "links_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_activity";
            referencedColumns: ["user_id"];
          },
        ];
      };
      organization_invitations: {
        Row: {
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string | null;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          organization_id: string;
          role: string;
          token: string;
        };
        Insert: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string | null;
          email: string;
          expires_at: string;
          id?: string;
          invited_by: string;
          organization_id: string;
          role?: string;
          token: string;
        };
        Update: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string | null;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          organization_id?: string;
          role?: string;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_invitations_accepted_by_fkey";
            columns: ["accepted_by"];
            isOneToOne: false;
            referencedRelation: "user_activity";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "organization_invitations_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "user_activity";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organization_metrics";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_members: {
        Row: {
          invited_at: string | null;
          invited_by: string | null;
          joined_at: string | null;
          organization_id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          invited_at?: string | null;
          invited_by?: string | null;
          joined_at?: string | null;
          organization_id: string;
          role?: string;
          user_id: string;
        };
        Update: {
          invited_at?: string | null;
          invited_by?: string | null;
          joined_at?: string | null;
          organization_id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "user_activity";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organization_metrics";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_activity";
            referencedColumns: ["user_id"];
          },
        ];
      };
      organization_settings: {
        Row: {
          analytics_retention_days: number | null;
          branding_enabled: boolean | null;
          collect_ip_addresses: boolean | null;
          created_at: string | null;
          custom_branded_domains_enabled: boolean | null;
          default_domain: string | null;
          enable_bio_pages: boolean | null;
          enable_campaigns: boolean | null;
          enable_custom_domains: boolean | null;
          enable_custom_qr: boolean | null;
          enable_custom_slugs: boolean | null;
          enable_extended_analytics: boolean | null;
          enable_fraud_detection: boolean | null;
          enable_link_preview_customization: boolean | null;
          enable_link_rotation: boolean | null;
          enable_password_protection: boolean | null;
          enable_pixels: boolean | null;
          enable_scheduled_links: boolean | null;
          gdpr_consent_required: boolean | null;
          ip_anonymization: boolean | null;
          max_data_retention_days: number | null;
          max_links: number | null;
          max_team_members: number | null;
          organization_id: string;
          privacy_policy_url: string | null;
          qr_codes_limit: number | null;
          updated_at: string | null;
        };
        Insert: {
          analytics_retention_days?: number | null;
          branding_enabled?: boolean | null;
          collect_ip_addresses?: boolean | null;
          created_at?: string | null;
          custom_branded_domains_enabled?: boolean | null;
          default_domain?: string | null;
          enable_bio_pages?: boolean | null;
          enable_campaigns?: boolean | null;
          enable_custom_domains?: boolean | null;
          enable_custom_qr?: boolean | null;
          enable_custom_slugs?: boolean | null;
          enable_extended_analytics?: boolean | null;
          enable_fraud_detection?: boolean | null;
          enable_link_preview_customization?: boolean | null;
          enable_link_rotation?: boolean | null;
          enable_password_protection?: boolean | null;
          enable_pixels?: boolean | null;
          enable_scheduled_links?: boolean | null;
          gdpr_consent_required?: boolean | null;
          ip_anonymization?: boolean | null;
          max_data_retention_days?: number | null;
          max_links?: number | null;
          max_team_members?: number | null;
          organization_id: string;
          privacy_policy_url?: string | null;
          qr_codes_limit?: number | null;
          updated_at?: string | null;
        };
        Update: {
          analytics_retention_days?: number | null;
          branding_enabled?: boolean | null;
          collect_ip_addresses?: boolean | null;
          created_at?: string | null;
          custom_branded_domains_enabled?: boolean | null;
          default_domain?: string | null;
          enable_bio_pages?: boolean | null;
          enable_campaigns?: boolean | null;
          enable_custom_domains?: boolean | null;
          enable_custom_qr?: boolean | null;
          enable_custom_slugs?: boolean | null;
          enable_extended_analytics?: boolean | null;
          enable_fraud_detection?: boolean | null;
          enable_link_preview_customization?: boolean | null;
          enable_link_rotation?: boolean | null;
          enable_password_protection?: boolean | null;
          enable_pixels?: boolean | null;
          enable_scheduled_links?: boolean | null;
          gdpr_consent_required?: boolean | null;
          ip_anonymization?: boolean | null;
          max_data_retention_days?: number | null;
          max_links?: number | null;
          max_team_members?: number | null;
          organization_id?: string;
          privacy_policy_url?: string | null;
          qr_codes_limit?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organization_metrics";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "organization_settings_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string | null;
          created_by: string;
          id: string;
          logo_url: string | null;
          name: string;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by: string;
          id?: string;
          logo_url?: string | null;
          name: string;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          id?: string;
          logo_url?: string | null;
          name?: string;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "user_activity";
            referencedColumns: ["user_id"];
          },
        ];
      };
      pixels: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          organization_id: string;
          pixel_id: string;
          platform: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          organization_id: string;
          pixel_id: string;
          platform: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          organization_id?: string;
          pixel_id?: string;
          platform?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pixels_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organization_metrics";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "pixels_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string | null;
          full_name: string | null;
          id: string;
          profile_picture_svg: string;
          profile_picture_url: string | null;
          updated_at: string | null;
          username: string | null;
          username_updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          full_name?: string | null;
          id: string;
          profile_picture_svg: string;
          profile_picture_url?: string | null;
          updated_at?: string | null;
          username?: string | null;
          username_updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          full_name?: string | null;
          id?: string;
          profile_picture_svg?: string;
          profile_picture_url?: string | null;
          updated_at?: string | null;
          username?: string | null;
          username_updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "user_activity";
            referencedColumns: ["user_id"];
          },
        ];
      };
      qr_codes: {
        Row: {
          background_color: string | null;
          correction_level: string | null;
          created_at: string | null;
          customization: Json | null;
          foreground_color: string | null;
          id: string;
          link_id: string;
          logo_url: string | null;
          size: number | null;
          updated_at: string | null;
        };
        Insert: {
          background_color?: string | null;
          correction_level?: string | null;
          created_at?: string | null;
          customization?: Json | null;
          foreground_color?: string | null;
          id?: string;
          link_id: string;
          logo_url?: string | null;
          size?: number | null;
          updated_at?: string | null;
        };
        Update: {
          background_color?: string | null;
          correction_level?: string | null;
          created_at?: string | null;
          customization?: Json | null;
          foreground_color?: string | null;
          id?: string;
          link_id?: string;
          logo_url?: string | null;
          size?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "qr_codes_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: true;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null;
          created_at: string | null;
          current_period_end: string;
          current_period_start: string;
          id: string;
          organization_id: string;
          payment_provider: string | null;
          payment_provider_subscription_id: string | null;
          plan_id: string;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
          current_period_end: string;
          current_period_start: string;
          id?: string;
          organization_id: string;
          payment_provider?: string | null;
          payment_provider_subscription_id?: string | null;
          plan_id: string;
          status: string;
          updated_at?: string | null;
        };
        Update: {
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
          current_period_end?: string;
          current_period_start?: string;
          id?: string;
          organization_id?: string;
          payment_provider?: string | null;
          payment_provider_subscription_id?: string | null;
          plan_id?: string;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organization_metrics";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "subscriptions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          color: string | null;
          created_at: string | null;
          id: string;
          name: string;
          organization_id: string | null;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          id?: string;
          name: string;
          organization_id?: string | null;
          user_id: string;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          id?: string;
          name?: string;
          organization_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tags_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organization_metrics";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "tags_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tags_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_activity";
            referencedColumns: ["user_id"];
          },
        ];
      };
      user_consent: {
        Row: {
          consent_document_url: string | null;
          consent_given: boolean;
          consent_timestamp: string | null;
          consent_type: string;
          consent_version: string | null;
          id: string;
          ip_address: string | null;
          revoked_at: string | null;
          user_id: string;
        };
        Insert: {
          consent_document_url?: string | null;
          consent_given: boolean;
          consent_timestamp?: string | null;
          consent_type: string;
          consent_version?: string | null;
          id?: string;
          ip_address?: string | null;
          revoked_at?: string | null;
          user_id: string;
        };
        Update: {
          consent_document_url?: string | null;
          consent_given?: boolean;
          consent_timestamp?: string | null;
          consent_type?: string;
          consent_version?: string | null;
          id?: string;
          ip_address?: string | null;
          revoked_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_consent_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "user_activity";
            referencedColumns: ["user_id"];
          },
        ];
      };
    };
    Views: {
      campaign_metrics: {
        Row: {
          avg_clicks_per_link: number | null;
          campaign_id: string | null;
          campaign_name: string | null;
          first_link_created: string | null;
          last_link_created: string | null;
          organization_id: string | null;
          total_clicks: number | null;
          total_links: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "campaigns_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organization_metrics";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "campaigns_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_metrics: {
        Row: {
          avg_clicks_per_link: number | null;
          organization_id: string | null;
          organization_name: string | null;
          total_bio_pages: number | null;
          total_campaigns: number | null;
          total_clicks: number | null;
          total_custom_domains: number | null;
          total_links: number | null;
          total_members: number | null;
        };
        Relationships: [];
      };
      user_activity: {
        Row: {
          email: string | null;
          last_invitation_sent: string | null;
          last_link_created: string | null;
          total_link_clicks: number | null;
          total_links_created: number | null;
          total_organizations: number | null;
          user_id: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      accept_organization_invitation: {
        Args: { invitation_token: string };
        Returns: boolean;
      };
      anonymize_ip: {
        Args: { ip: string };
        Returns: string;
      };
      archive_old_clicks: {
        Args: { retention_days?: number };
        Returns: undefined;
      };
      check_click_fraud: {
        Args: {
          p_link_id: string;
          p_ip_address: string;
          p_user_agent: string;
          p_referrer: string;
          p_country: string;
        };
        Returns: Json;
      };
      create_clicks_partition: {
        Args: { year: number; month: number };
        Returns: undefined;
      };
      create_future_partitions: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      create_organization: {
        Args: { org_name: string; org_slug: string; plan_id?: string };
        Returns: string;
      };
      generate_base62_id: {
        Args: { length?: number };
        Returns: string;
      };
      generate_profile_picture: {
        Args: { user_identifier: string };
        Returns: string;
      };
      invite_to_organization: {
        Args: { org_id: string; user_email: string; user_role?: string };
        Returns: string;
      };
      is_link_active: {
        Args: { link_id: string };
        Returns: boolean;
      };
      json_object_agg_merge: {
        Args: { jsonb_array: Json[] };
        Returns: Json;
      };
      random_bright_color: {
        Args: { seed_val: number; exclude_color?: string };
        Returns: string;
      };
      set_link_password: {
        Args: { link_id: string; password: string };
        Returns: boolean;
      };
      update_monthly_analytics: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      update_organization_features: {
        Args: { org_id: string; plan_id: string };
        Returns: undefined;
      };
      update_weekly_analytics: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      verify_link_password: {
        Args: { link_id: string; password: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
