import { createMockSupplier } from '@/lib/mock-suppliers';
import {
  AuditLog,
  MaterialRequest,
  PurchaseRequisition,
  Quote,
  QuoteApproval,
  QuoteLineItem,
  RFQ,
} from '@/types/procurement';

export const purchaseRequisitions: PurchaseRequisition[] = [];
export const prAuditLogs: AuditLog[] = [];

function buildSampleQuoteApproval(materialRequest: MaterialRequest, supplierQuote: Quote): QuoteApproval {
  const rfq: RFQ = {
    id: 'rfq-001',
    rfq_number: 'RFQ-001',
    material_request_id: materialRequest.id,
    material_request: materialRequest,
    status: 'sent',
    created_at: materialRequest.created_at,
    updated_at: materialRequest.updated_at,
    sent_at: materialRequest.created_at,
    due_date: materialRequest.created_at,
    suppliers: [],
    quotes: [supplierQuote],
    created_by: 'user-002',
    created_by_name: 'Jane Smith',
    comparison_summary: undefined,
  };

  return {
    id: 'qa-001',
    quote_pack_id: 'qp-001',
    quote_pack: {
      id: 'qp-001',
      rfq_id: rfq.id,
      rfq,
      status: 'approved',
      created_at: materialRequest.created_at,
      sent_at: materialRequest.created_at,
      approved_at: materialRequest.created_at,
      quotes: rfq.quotes,
      comparison_data: {
        total_savings: 0,
        recommended_suppliers: [supplierQuote.supplier_id],
        key_differences: ['Best value selection captured'],
        risk_assessment: 'Low risk',
      },
      created_by: rfq.created_by,
      created_by_name: rfq.created_by_name,
    },
    status: 'approved',
    created_at: materialRequest.created_at,
    updated_at: materialRequest.updated_at,
    approved_at: materialRequest.created_at,
    approved_by: 'approver-000',
    approved_by_name: 'Sourcing Lead',
    comments: 'Approved for PR generation',
    line_item_decisions: [
      {
        id: 'qad-001',
        quote_approval_id: 'qa-001',
        mr_line_item_id: materialRequest.line_items[0].id,
        mr_line_item: materialRequest.line_items[0],
        selected_quote_id: supplierQuote.id,
        selected_quote: supplierQuote,
        decision: 'approved',
        comments: 'Best price and lead time',
        created_at: materialRequest.created_at,
      },
    ],
  };
}

function buildSamplePurchaseRequisition(): PurchaseRequisition {
  const timestamp = new Date().toISOString();
  const supplier = createMockSupplier({
    id: 'supplier-001',
    supplier_code: 'SUP-001',
    name: 'ABC Construction Supplies',
    email: 'quotes@abc.com',
    category: 'Construction',
    rating: 4.5,
    quote_count: 15,
    avg_response_time: 24,
    status: 'approved',
    has_been_used: true,
  });

  const mrLineItem = {
    id: 'mri-001',
    item_code: 'ITEM-001',
    description: 'Safety Helmet',
    uom: 'PCS',
    quantity: 10,
    unit_price: 1000,
  };

  const materialRequest: MaterialRequest = {
    id: 'mr-001',
    mrn: 'MR-001',
    project_id: '1',
    project_name: 'Project Alpha',
    requester_id: 'user-001',
    requester_name: 'John Doe',
    status: 'approved',
    created_at: timestamp,
    updated_at: timestamp,
    line_items: [mrLineItem],
    attachments: [],
    remarks: 'Urgent safety equipment replenishment',
  };

  const quoteLineItem: QuoteLineItem = {
    id: 'qli-001',
    quote_id: 'q-001',
    mr_line_item_id: mrLineItem.id,
    mr_line_item: mrLineItem,
    unit_price: 950,
    quantity: 10,
    total_price: 9500,
    lead_time_days: 7,
    remarks: 'Includes bulk discount',
  };

  const supplierQuote: Quote = {
    id: 'q-001',
    rfq_id: 'rfq-001',
    supplier_id: supplier.id,
    supplier,
    status: 'submitted',
    submitted_at: timestamp,
    valid_until: timestamp,
    total_amount: 9500,
    currency: 'AED',
    line_items: [quoteLineItem],
    attachments: [],
    created_by: supplier.id,
    created_by_name: supplier.name,
    terms_conditions: 'Net 30 with partial shipments allowed',
  };

  const quoteApproval = buildSampleQuoteApproval(materialRequest, supplierQuote);

  const pr: PurchaseRequisition = {
    id: 'pr-001',
    pr_number: 'PR-2025-001',
    project_id: materialRequest.project_id,
    project_name: materialRequest.project_name,
    supplier_id: supplier.id,
    supplier,
    status: 'under_review',
    total_value: 15000,
    currency: 'AED',
    total_value_aed: 15000,
    total_value_usd: 4080,
    created_at: timestamp,
    updated_at: timestamp,
    submitted_at: timestamp,
    created_by: 'procurement-user',
    created_by_name: 'Procurement Team',
    approvals: [
      {
        id: 'apr-001',
        pr_id: 'pr-001',
        approver_id: 'approver-001',
        approver_name: 'Procurement Lead',
        approval_level: 1,
        status: 'approved',
        comments: 'Budget confirmed for procurement',
        approved_at: timestamp,
        rejected_at: undefined,
        created_at: timestamp,
      },
    ],
    comments: 'Awaiting finance approval for release',
    line_items: [
      {
        id: 'prli-001',
        pr_id: 'pr-001',
        mr_line_item_id: mrLineItem.id,
        mr_line_item: mrLineItem,
        quote_id: supplierQuote.id,
        quote: supplierQuote,
        quantity: 10,
        unit_price: 1000,
        total_price: 10000,
        lead_time_days: 7,
        remarks: 'Includes expedited shipping',
      },
    ],
    quote_approval_id: quoteApproval.id,
    quote_approval: quoteApproval,
  };

  return pr;
}

export function initializePRMockData() {
  if (purchaseRequisitions.length === 0) {
    purchaseRequisitions.push(buildSamplePurchaseRequisition());
  }
}

export function resetPRMockData() {
  purchaseRequisitions.splice(0, purchaseRequisitions.length);
  prAuditLogs.splice(0, prAuditLogs.length);
  initializePRMockData();
}

initializePRMockData();
