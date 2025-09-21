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
  supplier_code: string; // Unique supplier code for identification
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
  // Enhanced fields for comprehensive management
  status: 'pending' | 'approved' | 'suspended' | 'inactive';
  approval_date?: string;
  approved_by?: string;
  approved_by_name?: string;
  approval_notes?: string;
  contacts: SupplierContact[];
  performance_metrics: SupplierPerformanceMetrics;
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_name: string;
  // Transaction usage tracking
  has_been_used: boolean; // Track if supplier has been used in any transactions
}

export interface ComplianceDoc {
  id: string;
  name: string;
  url: string;
  expiry_date: string;
  is_valid: boolean;
}

export interface SupplierContact {
  id: string;
  supplier_id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface SupplierPerformanceMetrics {
  id: string;
  supplier_id: string;
  total_quotes: number;
  successful_quotes: number;
  avg_response_time_hours: number;
  on_time_delivery_rate: number;
  quality_rating: number;
  communication_rating: number;
  last_updated: string;
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
  entity_type: 'material_request' | 'rfq' | 'quote' | 'quote_pack' | 'purchase_requisition' | 'quote_approval' | 'purchase_order' | 'supplier';
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

// Purchase Order (PO) related interfaces
export interface PurchaseOrder {
  id: string;
  po_number: string;
  project_id: string;
  project_name: string;
  supplier_id: string;
  supplier: Supplier;
  status: 'draft' | 'sent' | 'acknowledged' | 'in_progress' | 'delivered' | 'invoiced' | 'paid';
  total_value: number;
  currency: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  acknowledged_at?: string;
  delivered_at?: string;
  invoiced_at?: string;
  paid_at?: string;
  created_by: string;
  created_by_name: string;
  sent_by?: string;
  sent_by_name?: string;
  acknowledged_by?: string;
  acknowledged_by_name?: string;
  delivery_date?: string;
  invoice_number?: string;
  payment_terms: string;
  delivery_address: string;
  comments?: string;
  line_items: POLineItem[];
  status_history: POStatusHistory[];
  attachments: POAttachment[];
  pr_id: string;
  pr: PurchaseRequisition;
}

export interface POLineItem {
  id: string;
  po_id: string;
  pr_line_item_id: string;
  pr_line_item: PRLineItem;
  quantity: number;
  unit_price: number;
  total_price: number;
  delivery_date?: string;
  remarks?: string;
  created_at: string;
}

export interface POStatusHistory {
  id: string;
  po_id: string;
  status: string;
  previous_status?: string;
  changed_by: string;
  changed_by_name: string;
  comments?: string;
  changed_at: string;
}

export interface POAttachment {
  id: string;
  po_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_by_name: string;
  created_at: string;
}

export interface PODashboardProps {
  userRole: 'requester' | 'procurement' | 'approver' | 'admin';
}

export interface PODetailViewProps {
  poId: string;
  userRole: 'requester' | 'procurement' | 'approver' | 'admin';
}

export interface POStatusUpdateFormProps {
  po: PurchaseOrder;
  onStatusUpdated: (poId: string) => void;
  onCancel: () => void;
}

// Supplier Management component props
export interface SupplierDashboardProps {
  userRole: 'requester' | 'procurement' | 'approver' | 'admin';
}

export interface SupplierDetailViewProps {
  supplierId: string;
  userRole: 'requester' | 'procurement' | 'approver' | 'admin';
}

export interface SupplierFormProps {
  supplier?: Supplier;
  onSave: (supplier: Supplier) => void;
  onCancel: () => void;
}

export interface SupplierApprovalFormProps {
  supplier: Supplier;
  onApprovalSubmitted: (supplierId: string) => void;
  onCancel: () => void;
}

export interface SupplierContactManagerProps {
  supplierId: string;
  contacts: SupplierContact[];
  onContactsUpdated: (contacts: SupplierContact[]) => void;
}

// Item Database Management interfaces
export interface Item {
  id: string;
  item_code: string;
  description: string;
  category: string;
  uom: string;
  brand?: string;
  model?: string;
  specifications?: Record<string, string | number | boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_name: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_by_name?: string;
  approval_date?: string;
  approval_notes?: string;
}

export interface ItemPrice {
  id: string;
  item_id: string;
  supplier_id: string;
  supplier_name: string;
  unit_price: number;
  currency: string;
  valid_from: string;
  valid_to?: string;
  lead_time_days?: number;
  minimum_order_qty?: number;
  created_at: string;
}

export interface SupplierCapability {
  id: string;
  supplier_id: string;
  supplier_name: string;
  item_id: string;
  item_code: string;
  is_primary_supplier: boolean;
  capability_rating: number;
  notes?: string;
  created_at: string;
}

export interface PriceTrend {
  date: string;
  price: number;
  supplier_name: string;
  currency: string;
}

export interface ItemSearchFilters {
  search?: string;
  category?: string;
  supplier_id?: string;
  price_min?: number;
  price_max?: number;
  is_active?: boolean;
  approval_status?: string;
}

// Item Management component props
export interface ItemDashboardProps {
  userRole: 'requester' | 'procurement' | 'approver' | 'admin';
}

export interface ItemDetailViewProps {
  itemId: string;
  userRole: 'requester' | 'procurement' | 'approver' | 'admin';
}

export interface ItemFormProps {
  item?: Item;
  onSave: (item: Item) => void;
  onCancel: () => void;
}

export interface PriceHistoryChartProps {
  itemId: string;
  prices: ItemPrice[];
}

export interface SupplierCapabilityMatrixProps {
  itemId: string;
  capabilities: SupplierCapability[];
  onCapabilityUpdated: (capability: SupplierCapability) => void;
}

export interface ItemSearchAndFilterProps {
  onFiltersChanged: (filters: ItemSearchFilters) => void;
  onSearch: (searchTerm: string) => void;
}
