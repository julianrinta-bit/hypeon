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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          brujo_report: Json | null
          channel_id: string
          content_dna: Json | null
          created_at: string | null
          declared_objective: string | null
          emergency_recommendation: string | null
          emergency_type: string | null
          goal_module: Json | null
          id: string
          inferred_objective: string | null
          job_id: string
          lifecycle_stage: string | null
          niche_classification_id: string | null
          objective_gap: Json | null
          outliers: Json | null
          overall_grade: string | null
          previous_analysis_id: string | null
          public_id: string | null
          publication_plan_benchmark: Json | null
          recommendation: string | null
          report_card_url: string | null
          score_content_consistency: number | null
          score_deltas: Json | null
          score_engagement_health: number | null
          score_growth_trajectory: number | null
          score_outlier_detection: number | null
          score_thumbnail_patterns: number | null
          score_title_quality: number | null
          succession_trigger: Json | null
          transcript_coverage: number | null
          user_id: string
          vertical_advisory: Json | null
          weighted_scores: Json | null
        }
        Insert: {
          brujo_report?: Json | null
          channel_id: string
          content_dna?: Json | null
          created_at?: string | null
          declared_objective?: string | null
          emergency_recommendation?: string | null
          emergency_type?: string | null
          goal_module?: Json | null
          id?: string
          inferred_objective?: string | null
          job_id: string
          lifecycle_stage?: string | null
          niche_classification_id?: string | null
          objective_gap?: Json | null
          outliers?: Json | null
          overall_grade?: string | null
          previous_analysis_id?: string | null
          public_id?: string | null
          publication_plan_benchmark?: Json | null
          recommendation?: string | null
          report_card_url?: string | null
          score_content_consistency?: number | null
          score_deltas?: Json | null
          score_engagement_health?: number | null
          score_growth_trajectory?: number | null
          score_outlier_detection?: number | null
          score_thumbnail_patterns?: number | null
          score_title_quality?: number | null
          succession_trigger?: Json | null
          transcript_coverage?: number | null
          user_id: string
          vertical_advisory?: Json | null
          weighted_scores?: Json | null
        }
        Update: {
          brujo_report?: Json | null
          channel_id?: string
          content_dna?: Json | null
          created_at?: string | null
          declared_objective?: string | null
          emergency_recommendation?: string | null
          emergency_type?: string | null
          goal_module?: Json | null
          id?: string
          inferred_objective?: string | null
          job_id?: string
          lifecycle_stage?: string | null
          niche_classification_id?: string | null
          objective_gap?: Json | null
          outliers?: Json | null
          overall_grade?: string | null
          previous_analysis_id?: string | null
          public_id?: string | null
          publication_plan_benchmark?: Json | null
          recommendation?: string | null
          report_card_url?: string | null
          score_content_consistency?: number | null
          score_deltas?: Json | null
          score_engagement_health?: number | null
          score_growth_trajectory?: number | null
          score_outlier_detection?: number | null
          score_thumbnail_patterns?: number | null
          score_title_quality?: number | null
          succession_trigger?: Json | null
          transcript_coverage?: number | null
          user_id?: string
          vertical_advisory?: Json | null
          weighted_scores?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "analyses_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "analysis_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyses_niche_classification_id_fkey"
            columns: ["niche_classification_id"]
            isOneToOne: false
            referencedRelation: "channel_niche_classifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyses_previous_analysis_id_fkey"
            columns: ["previous_analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_competitors: {
        Row: {
          analysis_id: string
          comparison_data: Json | null
          competitor_id: string
          created_at: string | null
          id: string
          justification: string | null
          rank: number | null
          user_feedback: string | null
        }
        Insert: {
          analysis_id: string
          comparison_data?: Json | null
          competitor_id: string
          created_at?: string | null
          id?: string
          justification?: string | null
          rank?: number | null
          user_feedback?: string | null
        }
        Update: {
          analysis_id?: string
          comparison_data?: Json | null
          competitor_id?: string
          created_at?: string | null
          id?: string
          justification?: string | null
          rank?: number | null
          user_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_competitors_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_competitors_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_history: {
        Row: {
          channel_id: string
          created_at: string | null
          id: string
          overall_grade: string | null
          scores: Json
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          id?: string
          overall_grade?: string | null
          scores: Json
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          id?: string
          overall_grade?: string | null
          scores?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_history_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_jobs: {
        Row: {
          audit_deliver_after: string | null
          audit_delivered_at: string | null
          audit_opened_at: string | null
          audit_ready_at: string | null
          channel_id: string
          completed_at: string | null
          created_at: string | null
          email_verified: boolean | null
          error_message: string | null
          error_stage: string | null
          goal: string
          id: string
          is_reanalysis: boolean | null
          last_heartbeat: string | null
          max_retries: number | null
          previous_analysis_id: string | null
          promo_code: string | null
          promo_synced_at: string | null
          public_id: string | null
          qualification_data: Json | null
          qualification_responded: boolean | null
          qualification_sent_at: string | null
          qualification_token: string | null
          retry_count: number | null
          session_id: string | null
          started_at: string | null
          status: string
          transcript_success_count: number | null
          transcript_total_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audit_deliver_after?: string | null
          audit_delivered_at?: string | null
          audit_opened_at?: string | null
          audit_ready_at?: string | null
          channel_id: string
          completed_at?: string | null
          created_at?: string | null
          email_verified?: boolean | null
          error_message?: string | null
          error_stage?: string | null
          goal: string
          id?: string
          is_reanalysis?: boolean | null
          last_heartbeat?: string | null
          max_retries?: number | null
          previous_analysis_id?: string | null
          promo_code?: string | null
          promo_synced_at?: string | null
          public_id?: string | null
          qualification_data?: Json | null
          qualification_responded?: boolean | null
          qualification_sent_at?: string | null
          qualification_token?: string | null
          retry_count?: number | null
          session_id?: string | null
          started_at?: string | null
          status?: string
          transcript_success_count?: number | null
          transcript_total_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audit_deliver_after?: string | null
          audit_delivered_at?: string | null
          audit_opened_at?: string | null
          audit_ready_at?: string | null
          channel_id?: string
          completed_at?: string | null
          created_at?: string | null
          email_verified?: boolean | null
          error_message?: string | null
          error_stage?: string | null
          goal?: string
          id?: string
          is_reanalysis?: boolean | null
          last_heartbeat?: string | null
          max_retries?: number | null
          previous_analysis_id?: string | null
          promo_code?: string | null
          promo_synced_at?: string | null
          public_id?: string | null
          qualification_data?: Json | null
          qualification_responded?: boolean | null
          qualification_sent_at?: string | null
          qualification_token?: string | null
          retry_count?: number | null
          session_id?: string | null
          started_at?: string | null
          status?: string
          transcript_success_count?: number | null
          transcript_total_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_jobs_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_jobs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "visitor_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_queue: {
        Row: {
          channel_url: string
          completed_at: string | null
          created_at: string
          email: string | null
          error_message: string | null
          html_path: string | null
          id: string
          prospect_name: string | null
          retry_count: number
          started_at: string | null
          status: string
        }
        Insert: {
          channel_url: string
          completed_at?: string | null
          created_at?: string
          email?: string | null
          error_message?: string | null
          html_path?: string | null
          id?: string
          prospect_name?: string | null
          retry_count?: number
          started_at?: string | null
          status?: string
        }
        Update: {
          channel_url?: string
          completed_at?: string | null
          created_at?: string
          email?: string | null
          error_message?: string | null
          html_path?: string | null
          id?: string
          prospect_name?: string | null
          retry_count?: number
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      channel_fingerprints: {
        Row: {
          expires_at: string | null
          fetched_at: string | null
          fingerprint: Json
          id: string
          signals: Json
          youtube_channel_id: string
        }
        Insert: {
          expires_at?: string | null
          fetched_at?: string | null
          fingerprint: Json
          id?: string
          signals: Json
          youtube_channel_id: string
        }
        Update: {
          expires_at?: string | null
          fetched_at?: string | null
          fingerprint?: Json
          id?: string
          signals?: Json
          youtube_channel_id?: string
        }
        Relationships: []
      }
      channel_niche_classifications: {
        Row: {
          analysis_id: string | null
          bayes_factor: number | null
          behavioral_fingerprint: Json | null
          channel_id: string
          classification_confidence: string | null
          created_at: string | null
          id: string
          lifecycle_stage: string | null
          membership_probability: number | null
          niche_alpha: number | null
          niche_analysis_id: string | null
          niche_id: string | null
          nis: string | null
          succession_trigger: Json | null
        }
        Insert: {
          analysis_id?: string | null
          bayes_factor?: number | null
          behavioral_fingerprint?: Json | null
          channel_id: string
          classification_confidence?: string | null
          created_at?: string | null
          id?: string
          lifecycle_stage?: string | null
          membership_probability?: number | null
          niche_alpha?: number | null
          niche_analysis_id?: string | null
          niche_id?: string | null
          nis?: string | null
          succession_trigger?: Json | null
        }
        Update: {
          analysis_id?: string | null
          bayes_factor?: number | null
          behavioral_fingerprint?: Json | null
          channel_id?: string
          classification_confidence?: string | null
          created_at?: string | null
          id?: string
          lifecycle_stage?: string | null
          membership_probability?: number | null
          niche_alpha?: number | null
          niche_analysis_id?: string | null
          niche_id?: string | null
          nis?: string | null
          succession_trigger?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_niche_classifications_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_niche_classifications_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_niche_classifications_niche_analysis_id_fkey"
            columns: ["niche_analysis_id"]
            isOneToOne: false
            referencedRelation: "niche_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_niche_classifications_niche_id_fkey"
            columns: ["niche_id"]
            isOneToOne: false
            referencedRelation: "niche_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_scans: {
        Row: {
          channel_id: string
          channel_name: string | null
          content_leverage: number | null
          converted: boolean | null
          handle: string | null
          id: string
          insight_diagnosis: string | null
          ip: string | null
          pain_pattern: string | null
          scanned_at: string | null
          subscriber_conversion: number | null
          subscriber_count: number | null
          video_count: number | null
          view_count: number | null
        }
        Insert: {
          channel_id: string
          channel_name?: string | null
          content_leverage?: number | null
          converted?: boolean | null
          handle?: string | null
          id?: string
          insight_diagnosis?: string | null
          ip?: string | null
          pain_pattern?: string | null
          scanned_at?: string | null
          subscriber_conversion?: number | null
          subscriber_count?: number | null
          video_count?: number | null
          view_count?: number | null
        }
        Update: {
          channel_id?: string
          channel_name?: string | null
          content_leverage?: number | null
          converted?: boolean | null
          handle?: string | null
          id?: string
          insight_diagnosis?: string | null
          ip?: string | null
          pain_pattern?: string | null
          scanned_at?: string | null
          subscriber_conversion?: number | null
          subscriber_count?: number | null
          video_count?: number | null
          view_count?: number | null
        }
        Relationships: []
      }
      channels: {
        Row: {
          category: string | null
          created_at: string | null
          creation_date: string | null
          custom_url: string | null
          description: string | null
          fetched_at: string | null
          id: string
          is_verified: boolean | null
          linked_website: string | null
          name: string
          raw_metadata: Json | null
          socialblade_data: Json | null
          socialblade_fetched_at: string | null
          subscriber_count: number | null
          thumbnail_url: string | null
          total_views: number | null
          video_count: number | null
          youtube_channel_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          creation_date?: string | null
          custom_url?: string | null
          description?: string | null
          fetched_at?: string | null
          id?: string
          is_verified?: boolean | null
          linked_website?: string | null
          name: string
          raw_metadata?: Json | null
          socialblade_data?: Json | null
          socialblade_fetched_at?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          total_views?: number | null
          video_count?: number | null
          youtube_channel_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          creation_date?: string | null
          custom_url?: string | null
          description?: string | null
          fetched_at?: string | null
          id?: string
          is_verified?: boolean | null
          linked_website?: string | null
          name?: string
          raw_metadata?: Json | null
          socialblade_data?: Json | null
          socialblade_fetched_at?: string | null
          subscriber_count?: number | null
          thumbnail_url?: string | null
          total_views?: number | null
          video_count?: number | null
          youtube_channel_id?: string
        }
        Relationships: []
      }
      competitor_cache: {
        Row: {
          cached_at: string | null
          competitor_id: string
          id: string
          niche_keywords: string[]
          relevance_score: number | null
          subscriber_bracket: string | null
        }
        Insert: {
          cached_at?: string | null
          competitor_id: string
          id?: string
          niche_keywords: string[]
          relevance_score?: number | null
          subscriber_bracket?: string | null
        }
        Update: {
          cached_at?: string | null
          competitor_id?: string
          id?: string
          niche_keywords?: string[]
          relevance_score?: number | null
          subscriber_bracket?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_cache_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          created_at: string | null
          format_mix: Json | null
          id: string
          metadata_fetched_at: string | null
          name: string
          publish_frequency: number | null
          raw_metadata: Json | null
          recent_avg_views: number | null
          socialblade_data: Json | null
          socialblade_fetched_at: string | null
          stats_fetched_at: string | null
          subscriber_count: number | null
          top_video_90d: Json | null
          total_views: number | null
          video_count: number | null
          youtube_channel_id: string
        }
        Insert: {
          created_at?: string | null
          format_mix?: Json | null
          id?: string
          metadata_fetched_at?: string | null
          name: string
          publish_frequency?: number | null
          raw_metadata?: Json | null
          recent_avg_views?: number | null
          socialblade_data?: Json | null
          socialblade_fetched_at?: string | null
          stats_fetched_at?: string | null
          subscriber_count?: number | null
          top_video_90d?: Json | null
          total_views?: number | null
          video_count?: number | null
          youtube_channel_id: string
        }
        Update: {
          created_at?: string | null
          format_mix?: Json | null
          id?: string
          metadata_fetched_at?: string | null
          name?: string
          publish_frequency?: number | null
          raw_metadata?: Json | null
          recent_avg_views?: number | null
          socialblade_data?: Json | null
          socialblade_fetched_at?: string | null
          stats_fetched_at?: string | null
          subscriber_count?: number | null
          top_video_90d?: Json | null
          total_views?: number | null
          video_count?: number | null
          youtube_channel_id?: string
        }
        Relationships: []
      }
      deep_dives: {
        Row: {
          analysis_id: string
          content: Json
          created_at: string | null
          id: string
          is_unlocked: boolean | null
          module_type: string
          unlocked_at: string | null
        }
        Insert: {
          analysis_id: string
          content: Json
          created_at?: string | null
          id?: string
          is_unlocked?: boolean | null
          module_type: string
          unlocked_at?: string | null
        }
        Update: {
          analysis_id?: string
          content?: Json
          created_at?: string | null
          id?: string
          is_unlocked?: boolean | null
          module_type?: string
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deep_dives_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      email_tracking_events: {
        Row: {
          campaign: string | null
          created_at: string | null
          cta: string | null
          email_id: string | null
          event_type: string
          id: number
          ip_address: string | null
          prospect_id: string
          tenant_id: string | null
          user_agent: string | null
        }
        Insert: {
          campaign?: string | null
          created_at?: string | null
          cta?: string | null
          email_id?: string | null
          event_type: string
          id?: number
          ip_address?: string | null
          prospect_id: string
          tenant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          campaign?: string | null
          created_at?: string | null
          cta?: string | null
          email_id?: string | null
          event_type?: string
          id?: number
          ip_address?: string | null
          prospect_id?: string
          tenant_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      lead_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          score_delta: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          score_delta?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          score_delta?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_scores: {
        Row: {
          behavioral_score: number | null
          channel_data_score: number | null
          created_at: string | null
          decay_factor: number | null
          declared_score: number | null
          id: string
          last_behavioral_signal_at: string | null
          last_decay_at: string | null
          niche_cycle_phase: string | null
          niche_lead_score: number | null
          nis: string | null
          tier: string | null
          total_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          behavioral_score?: number | null
          channel_data_score?: number | null
          created_at?: string | null
          decay_factor?: number | null
          declared_score?: number | null
          id?: string
          last_behavioral_signal_at?: string | null
          last_decay_at?: string | null
          niche_cycle_phase?: string | null
          niche_lead_score?: number | null
          nis?: string | null
          tier?: string | null
          total_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          behavioral_score?: number | null
          channel_data_score?: number | null
          created_at?: string | null
          decay_factor?: number | null
          declared_score?: number | null
          id?: string
          last_behavioral_signal_at?: string | null
          last_decay_at?: string | null
          niche_cycle_phase?: string | null
          niche_lead_score?: number | null
          nis?: string | null
          tier?: string | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      local_worker_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_id: string
          job_type: string
          payload: Json
          result: Json | null
          retry_count: number | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_id: string
          job_type: string
          payload?: Json
          result?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_id?: string
          job_type?: string
          payload?: Json
          result?: Json | null
          retry_count?: number | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_worker_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "analysis_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      niche_analyses: {
        Row: {
          competitive_landscape: Json | null
          completed_at: string | null
          created_at: string | null
          entry_readiness_score: number | null
          error_message: string | null
          id: string
          keywords: string[]
          niche_id: string | null
          public_id: string | null
          region: string | null
          status: string
          topic: string
          user_id: string
        }
        Insert: {
          competitive_landscape?: Json | null
          completed_at?: string | null
          created_at?: string | null
          entry_readiness_score?: number | null
          error_message?: string | null
          id?: string
          keywords: string[]
          niche_id?: string | null
          public_id?: string | null
          region?: string | null
          status?: string
          topic: string
          user_id: string
        }
        Update: {
          competitive_landscape?: Json | null
          completed_at?: string | null
          created_at?: string | null
          entry_readiness_score?: number | null
          error_message?: string | null
          id?: string
          keywords?: string[]
          niche_id?: string | null
          public_id?: string | null
          region?: string | null
          status?: string
          topic?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "niche_analyses_niche_id_fkey"
            columns: ["niche_id"]
            isOneToOne: false
            referencedRelation: "niche_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "niche_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      niche_definitions: {
        Row: {
          centroid: Json
          competitiveness: string | null
          computed_at: string | null
          cycle_phase: string | null
          expires_at: string | null
          hhi: number | null
          id: string
          keywords: string[]
          member_channel_ids: string[]
          member_count: number
          niche_hash: string
        }
        Insert: {
          centroid: Json
          competitiveness?: string | null
          computed_at?: string | null
          cycle_phase?: string | null
          expires_at?: string | null
          hhi?: number | null
          id?: string
          keywords: string[]
          member_channel_ids: string[]
          member_count: number
          niche_hash: string
        }
        Update: {
          centroid?: Json
          competitiveness?: string | null
          computed_at?: string | null
          cycle_phase?: string | null
          expires_at?: string | null
          hhi?: number | null
          id?: string
          keywords?: string[]
          member_channel_ids?: string[]
          member_count?: number
          niche_hash?: string
        }
        Relationships: []
      }
      niche_indices: {
        Row: {
          computed_at: string | null
          id: string
          index_data: Json
          n_effective: number
          niche_id: string
          quality_gate_result: Json
        }
        Insert: {
          computed_at?: string | null
          id?: string
          index_data: Json
          n_effective: number
          niche_id: string
          quality_gate_result: Json
        }
        Update: {
          computed_at?: string | null
          id?: string
          index_data?: Json
          n_effective?: number
          niche_id?: string
          quality_gate_result?: Json
        }
        Relationships: [
          {
            foreignKeyName: "niche_indices_niche_id_fkey"
            columns: ["niche_id"]
            isOneToOne: true
            referencedRelation: "niche_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          channel_url: string | null
          created_at: string | null
          email: string
          first_country: string | null
          first_device_type: string | null
          first_language: string | null
          first_referrer: string | null
          first_utm_campaign: string | null
          first_utm_content: string | null
          first_utm_medium: string | null
          first_utm_source: string | null
          goal: string | null
          id: string
          last_active_at: string | null
          production_level: string | null
          publishing_frequency: string | null
          region: string | null
        }
        Insert: {
          channel_url?: string | null
          created_at?: string | null
          email: string
          first_country?: string | null
          first_device_type?: string | null
          first_language?: string | null
          first_referrer?: string | null
          first_utm_campaign?: string | null
          first_utm_content?: string | null
          first_utm_medium?: string | null
          first_utm_source?: string | null
          goal?: string | null
          id: string
          last_active_at?: string | null
          production_level?: string | null
          publishing_frequency?: string | null
          region?: string | null
        }
        Update: {
          channel_url?: string | null
          created_at?: string | null
          email?: string
          first_country?: string | null
          first_device_type?: string | null
          first_language?: string | null
          first_referrer?: string | null
          first_utm_campaign?: string | null
          first_utm_content?: string | null
          first_utm_medium?: string | null
          first_utm_source?: string | null
          goal?: string | null
          id?: string
          last_active_at?: string | null
          production_level?: string | null
          publishing_frequency?: string | null
          region?: string | null
        }
        Relationships: []
      }
      quota_usage: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          operation: string | null
          service: string
          units_used: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          operation?: string | null
          service: string
          units_used: number
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          operation?: string | null
          service?: string
          units_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "quota_usage_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "analysis_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_channels: {
        Row: {
          channel_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_channels_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_channels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      valid_promo_codes: {
        Row: {
          code: string
          discount_type: string | null
          discount_value: number | null
          is_active: boolean
          max_uses: number | null
          synced_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          discount_type?: string | null
          discount_value?: number | null
          is_active?: boolean
          max_uses?: number | null
          synced_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          discount_type?: string | null
          discount_value?: number | null
          is_active?: boolean
          max_uses?: number | null
          synced_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          channel_id: string
          comment_count: number | null
          description: string | null
          duration_seconds: number | null
          fetched_at: string | null
          hook_text: string | null
          id: string
          key_phrases: string[] | null
          like_count: number | null
          published_at: string | null
          raw_metadata: Json | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          transcript_fetched_at: string | null
          transcript_language: string | null
          transcript_source: string | null
          transcript_status: string | null
          transcript_word_count: number | null
          view_count: number | null
          youtube_video_id: string
        }
        Insert: {
          channel_id: string
          comment_count?: number | null
          description?: string | null
          duration_seconds?: number | null
          fetched_at?: string | null
          hook_text?: string | null
          id?: string
          key_phrases?: string[] | null
          like_count?: number | null
          published_at?: string | null
          raw_metadata?: Json | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          transcript_fetched_at?: string | null
          transcript_language?: string | null
          transcript_source?: string | null
          transcript_status?: string | null
          transcript_word_count?: number | null
          view_count?: number | null
          youtube_video_id: string
        }
        Update: {
          channel_id?: string
          comment_count?: number | null
          description?: string | null
          duration_seconds?: number | null
          fetched_at?: string | null
          hook_text?: string | null
          id?: string
          key_phrases?: string[] | null
          like_count?: number | null
          published_at?: string | null
          raw_metadata?: Json | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          transcript_fetched_at?: string | null
          transcript_language?: string | null
          transcript_source?: string | null
          transcript_status?: string | null
          transcript_word_count?: number | null
          view_count?: number | null
          youtube_video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: number
          session_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: never
          session_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: never
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "visitor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_sessions: {
        Row: {
          browser: string | null
          city: string | null
          converted: boolean
          converted_at: string | null
          country_code: string | null
          created_at: string
          device_type: string | null
          fbclid: string | null
          gclid: string | null
          id: string
          is_returning: boolean
          landing_page: string | null
          language: string | null
          max_scroll_pct: number
          os: string | null
          page_views: number
          promo_code: string | null
          referrer: string | null
          region: string | null
          screen_height: number | null
          screen_width: number | null
          time_on_site_s: number
          timezone: string | null
          updated_at: string
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          converted?: boolean
          converted_at?: string | null
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          fbclid?: string | null
          gclid?: string | null
          id?: string
          is_returning?: boolean
          landing_page?: string | null
          language?: string | null
          max_scroll_pct?: number
          os?: string | null
          page_views?: number
          promo_code?: string | null
          referrer?: string | null
          region?: string | null
          screen_height?: number | null
          screen_width?: number | null
          time_on_site_s?: number
          timezone?: string | null
          updated_at?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          converted?: boolean
          converted_at?: string | null
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          fbclid?: string | null
          gclid?: string | null
          id?: string
          is_returning?: boolean
          landing_page?: string | null
          language?: string | null
          max_scroll_pct?: number
          os?: string | null
          page_views?: number
          promo_code?: string | null
          referrer?: string | null
          region?: string | null
          screen_height?: number | null
          screen_width?: number | null
          time_on_site_s?: number
          timezone?: string | null
          updated_at?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_quota_usage: { Args: { p_service?: string }; Returns: number }
      nanoid: { Args: { size?: number }; Returns: string }
      pgmq_delete: {
        Args: { msg_id: number; queue_name: string }
        Returns: boolean
      }
      pgmq_read: {
        Args: { n: number; queue_name: string; sleep_seconds: number }
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "message_record"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      pgmq_send: {
        Args: { message: Json; queue_name: string }
        Returns: number
      }
      snapshot_and_queue_reanalysis: { Args: never; Returns: undefined }
      update_analysis_step: {
        Args: {
          p_analysis_id: string
          p_error?: string
          p_raw_data?: Json
          p_status: string
          p_step: number
          p_step_name: string
        }
        Returns: undefined
      }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
