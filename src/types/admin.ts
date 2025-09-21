// Admin Configuration Types
export interface MRFieldConfig {
  id: string;
  field_name: string;
  field_label: string;
  is_visible: boolean;
  is_required: boolean;
  display_order: number;
  field_type: string;
  validation_rules?: Record<string, string | number | boolean | string[]>;
  created_at: string;
  updated_at: string;
}

export interface AuthorizationMatrix {
  id: string;
  project_id: string;
  role: string;
  threshold_amount: number;
  approval_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CurrencyConfig {
  id: string;
  base_currency: string;
  usd_rate: number;
  last_updated: string;
  updated_by: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description?: string;
  updated_at: string;
  updated_by: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  projects: string[];
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'requester' | 'procurement' | 'approver' | 'admin';
  project_ids: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IntegrationConfig {
  id: string;
  integration_type: 'sso' | 'esignature';
  is_enabled: boolean;
  configuration: Record<string, string | number | boolean>;
  last_tested?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminDashboardData {
  total_users: number;
  active_users: number;
  total_projects: number;
  system_health: 'healthy' | 'warning' | 'error';
  recent_activity: AdminActivity[];
  system_stats: {
    total_mrs: number;
    total_prs: number;
    total_pos: number;
    total_suppliers: number;
  };
}

export interface AdminActivity {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
}

// Component Props
export interface AdminDashboardProps {
  userRole: 'admin';
}

export interface MRFieldConfigurationProps {
  fields: MRFieldConfig[];
  onUpdate: (fields: MRFieldConfig[]) => void;
}

export interface AuthorizationMatrixManagerProps {
  projectId: string;
  matrix: AuthorizationMatrix[];
  onUpdate: (matrix: AuthorizationMatrix[]) => void;
}

export interface CurrencyConfigurationProps {
  currency: CurrencyConfig;
  onUpdate: (config: CurrencyConfig) => void;
}

export interface UserManagementProps {
  users: AdminUser[];
  onUpdate: (user: AdminUser) => void;
  onDelete: (userId: string) => void;
}

export interface IntegrationManagementProps {
  integrations: IntegrationConfig[];
  onUpdate: (integration: IntegrationConfig) => void;
}

export interface SystemSettingsProps {
  settings: SystemSetting[];
  onUpdate: (setting: SystemSetting) => void;
}
