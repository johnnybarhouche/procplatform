export interface MaterialRequest {
  id: string;
  mrn: string;
  project_id: string;
  project_name: string;
  requester_id: string;
  requester_name: string;
  status: 'draft' | 'submitted' | 'in_progress' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  line_items: MRLineItem[];
  attachments: Attachment[];
  remarks?: string;
}

export interface MRLineItem {
  id: string;
  item_code: string;
  description: string;
  uom: string;
  quantity: number;
  unit_price: number;
  remarks?: string;
  location?: string;
  brand_asset?: string;
  serial_chassis_engine_no?: string;
  model_year?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  category: string;
  rating: number;
  quote_count: number;
  avg_response_time: number; // in hours
  last_quote_date: string;
  is_active: boolean;
  compliance_docs: ComplianceDoc[];
}

export interface ComplianceDoc {
  id: string;
  name: string;
  url: string;
  expiry_date: string;
  is_valid: boolean;
}

export interface RFQ {
  id: string;
  rfq_number: string;
  material_request_id: string;
  material_request: MaterialRequest;
  status: 'draft' | 'sent' | 'quotes_received' | 'comparison_ready' | 'quote_pack_sent' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  sent_at?: string;
  due_date?: string;
  suppliers: RFQSupplier[];
  quotes: Quote[];
  created_by: string;
  created_by_name: string;
}

export interface RFQSupplier {
  id: string;
  rfq_id: string;
  supplier_id: string;
  supplier: Supplier;
  status: 'pending' | 'responded' | 'declined';
  sent_at: string;
  responded_at?: string;
  portal_link: string;
  email_tracking_id?: string;
}

export interface Quote {
  id: string;
  rfq_id: string;
  supplier_id: string;
  supplier: Supplier;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_at: string;
  valid_until: string;
  total_amount: number;
  currency: string;
  terms_conditions?: string;
  line_items: QuoteLineItem[];
  attachments: Attachment[];
  created_by: string;
  created_by_name: string;
}

export interface QuoteLineItem {
  id: string;
  quote_id: string;
  mr_line_item_id: string;
  mr_line_item: MRLineItem;
  unit_price: number;
  quantity: number;
  total_price: number;
  lead_time_days: number;
  remarks?: string;
}

export interface QuotePack {
  id: string;
  rfq_id: string;
  rfq: RFQ;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  created_at: string;
  sent_at?: string;
  approved_at?: string;
  quotes: Quote[];
  comparison_data: ComparisonData;
  created_by: string;
  created_by_name: string;
  approved_by?: string;
  approved_by_name?: string;
}

export interface ComparisonData {
  total_savings: number;
  recommended_suppliers: string[];
  key_differences: string[];
  risk_assessment: string;
}

export interface AuditLog {
  id: string;
  entity_type: 'material_request' | 'rfq' | 'quote' | 'quote_pack' | 'purchase_requisition' | 'quote_approval';
  entity_id: string;
  action: string;
  actor_id: string;
  actor_name: string;
  timestamp: string;
  before_data?: unknown;
  after_data?: unknown;
  ip_address?: string;
  user_agent?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive' | 'completed';
  created_at: string;
  updated_at: string;
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

export interface QuoteApproval {
  id: string;
  quote_pack_id: string;
  quote_pack: QuotePack;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
  approved_by_name?: string;
  comments?: string;
  line_item_decisions: LineItemDecision[];
}

export interface LineItemDecision {
  id: string;
  quote_approval_id: string;
  mr_line_item_id: string;
  mr_line_item: MRLineItem;
  selected_quote_id: string;
  selected_quote: Quote;
  decision: 'approved' | 'rejected';
  comments?: string;
  created_at: string;
}

export interface QuoteApprovalDashboardProps {
  userRole: 'requester' | 'approver' | 'admin';
}

// Purchase Requisition (PR) related interfaces
export interface PurchaseRequisition {
  id: string;
  pr_number: string;
  project_id: string;
  project_name: string;
  supplier_id: string;
  supplier: Supplier;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  total_value: number;
  currency: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  created_by: string;
  created_by_name: string;
  approved_by?: string;
  approved_by_name?: string;
  rejected_by?: string;
  rejected_by_name?: string;
  rejection_reason?: string;
  comments?: string;
  line_items: PRLineItem[];
  approvals: PRApproval[];
  quote_approval_id: string;
  quote_approval: QuoteApproval;
}

export interface PRLineItem {
  id: string;
  pr_id: string;
  mr_line_item_id: string;
  mr_line_item: MRLineItem;
  quote_id: string;
  quote: Quote;
  quantity: number;
  unit_price: number;
  total_price: number;
  lead_time_days: number;
  remarks?: string;
}

export interface PRApproval {
  id: string;
  pr_id: string;
  approver_id: string;
  approver_name: string;
  approval_level: number;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approved_at?: string;
  rejected_at?: string;
  created_at: string;
}

export interface AuthorizationMatrix {
  id: string;
  project_id: string;
  approval_level: number;
  threshold_min: number;
  threshold_max: number;
  approver_role: string;
  approver_user_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PRDashboardProps {
  userRole: 'requester' | 'procurement' | 'approver' | 'admin';
}

export interface PRDetailViewProps {
  prId: string;
  userRole: 'requester' | 'procurement' | 'approver' | 'admin';
}

export interface PRApprovalFormProps {
  pr: PurchaseRequisition;
  onApprovalSubmitted: (prId: string) => void;
  onCancel: () => void;
}
