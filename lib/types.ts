export type Role = "owner" | "admin" | "analyst" | "viewer";

export interface User {
  id: string; email: string; full_name: string;
  avatar_url: string | null; is_google_auth: boolean; created_at: string;
}
export interface Organization {
  id: string; name: string; slug: string; member_count: number; created_at: string;
}
export interface Member {
  id: string; user_email: string; user_name: string;
  role: Role; is_active: boolean; joined_at: string;
}
export interface Event {
  id: string; event_type: string; event_name: string;
  source: "api" | "csv" | "webhook"; properties: Record<string, any>;
  user_id: string | null; timestamp: string; ingested_at: string;
}
export interface Dashboard {
  id: string; name: string; description: string; is_public: boolean;
  public_token: string; widget_count: number; widgets: any[];
  created_at: string; updated_at: string;
}
export interface AlertRule {
  id: string; name: string; event_name: string; metric: string;
  condition: "gt" | "lt" | "eq"; threshold: number; window_minutes: number;
  status: "active" | "triggered" | "resolved" | "muted";
  notification_channels: string[]; created_at: string;
}
export interface AlertHistory {
  id: string; alert_name: string; triggered_value: number;
  threshold: number; triggered_at: string; notification_sent: boolean;
}
export interface APIKey {
  id: string; name: string; key_prefix: string; is_active: boolean;
  expires_at: string | null; created_at: string; key?: string;
}
