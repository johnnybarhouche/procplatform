import { purchaseRequisitions, initializePRMockData } from '@/lib/mock-data/prs';
import { AuditLog, PurchaseOrder } from '@/types/procurement';

export const purchaseOrders: PurchaseOrder[] = [];
export const poAuditLogs: AuditLog[] = [];

function buildSamplePurchaseOrder(): PurchaseOrder {
  initializePRMockData();
  const pr = purchaseRequisitions[0];
  const timestamp = new Date().toISOString();

  return {
    id: 'po-001',
    po_number: 'PO-ALPHA-001',
    project_id: pr.project_id,
    project_name: pr.project_name,
    supplier_id: pr.supplier_id,
    supplier: pr.supplier,
    status: 'draft',
    total_value: pr.total_value,
    currency: pr.currency,
    total_value_aed: pr.total_value_aed,
    total_value_usd: pr.total_value_usd,
    created_at: timestamp,
    updated_at: timestamp,
    created_by: 'user-002',
    created_by_name: 'Jane Smith',
    payment_terms: 'Net 30',
    delivery_address: 'Project Alpha Site, Dubai',
    comments: 'Waiting to be dispatched to supplier',
    line_items: pr.line_items.map((line, index) => ({
      id: `pol-${index + 1}`,
      po_id: 'po-001',
      pr_line_item_id: line.id,
      pr_line_item: line,
      quantity: line.quantity,
      unit_price: line.unit_price,
      total_price: line.total_price,
      delivery_date: undefined,
      remarks: line.remarks,
      created_at: timestamp,
    })),
    status_history: [
      {
        id: 'po-hist-001',
        po_id: 'po-001',
        status: 'draft',
        previous_status: 'generated',
        changed_by: 'system',
        changed_by_name: 'System',
        comments: 'PO generated from approved PR',
        changed_at: timestamp,
      },
      {
        id: 'po-hist-002',
        po_id: 'po-001',
        status: 'approved',
        previous_status: 'draft',
        changed_by: 'approver-001',
        changed_by_name: 'Finance Approver',
        comments: 'Approved for supplier dispatch',
        changed_at: timestamp,
      },
    ],
    attachments: [],
    pr_id: pr.id,
    pr,
  };
}

export function initializePOMockData() {
  if (purchaseOrders.length === 0) {
    purchaseOrders.push(buildSamplePurchaseOrder());
  }
}

export function resetPOMockData() {
  purchaseOrders.splice(0, purchaseOrders.length);
  poAuditLogs.splice(0, poAuditLogs.length);
  initializePOMockData();
}

initializePOMockData();
