import {
  AuditLog,
  LineItemDecision,
  Quote,
  QuoteApproval,
  QuotePack,
  QuoteLineItem,
  RFQ,
} from '@/types/procurement';
import { rfqStore } from '@/app/api/rfqs/route';

const quoteApprovalStore: QuoteApproval[] = [];
export const quoteApprovalAuditLogs: AuditLog[] = [];

function computeComparisonData(rfq: RFQ) {
  const selections: string[] = [];
  let totalSavings = 0;

  rfq.material_request.line_items.forEach((line) => {
    const quotesForLine: { quote: Quote; lineItem: QuoteLineItem }[] = rfq.quotes
      .map((quote) => {
        const lineItem = quote.line_items.find((item) => item.mr_line_item_id === line.id);
        return lineItem ? { quote, lineItem } : undefined;
      })
      .filter(Boolean) as { quote: Quote; lineItem: QuoteLineItem }[];

    if (!quotesForLine.length) {
      return;
    }

    const sorted = [...quotesForLine].sort((a, b) => a.lineItem.total_price - b.lineItem.total_price);
    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];
    selections.push(lowest.quote.supplier_id);
    totalSavings += highest.lineItem.total_price - lowest.lineItem.total_price;
  });

  return {
    total_savings: Number(totalSavings.toFixed(2)),
    recommended_suppliers: selections,
    key_differences: selections.length ? ['Supplier pricing variance captured'] : [],
    risk_assessment: 'Low',
  };
}

function createQuotePackFromRFQ(rfq: RFQ): QuotePack {
  return {
    id: `qp-${rfq.id}`,
    rfq_id: rfq.id,
    rfq,
    status: 'sent',
    created_at: new Date().toISOString(),
    quotes: rfq.quotes,
    comparison_data: computeComparisonData(rfq),
    created_by: rfq.created_by,
    created_by_name: rfq.created_by_name,
  };
}

function createQuoteApprovalFromRFQ(rfq: RFQ): QuoteApproval {
  const quotePack = createQuotePackFromRFQ(rfq);
  return {
    id: `qa-${rfq.id}`,
    quote_pack_id: quotePack.id,
    quote_pack: quotePack,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    line_item_decisions: [],
  };
}

export function seedQuoteApprovals() {
  if (quoteApprovalStore.length === 0 && rfqStore.length > 0) {
    const initialApproval = createQuoteApprovalFromRFQ(rfqStore[0]);
    quoteApprovalStore.push(initialApproval);
  }
}

export function getQuoteApprovals(): QuoteApproval[] {
  seedQuoteApprovals();
  return quoteApprovalStore;
}

export function getQuoteApproval(id: string): QuoteApproval | undefined {
  seedQuoteApprovals();
  return quoteApprovalStore.find((approval) => approval.id === id);
}

export function saveQuoteApproval(approval: QuoteApproval) {
  const index = quoteApprovalStore.findIndex((item) => item.id === approval.id);
  if (index === -1) {
    quoteApprovalStore.push(approval);
  } else {
    quoteApprovalStore[index] = approval;
  }
}

export function createQuoteApprovalForRFQ(rfqId: string): QuoteApproval | undefined {
  const rfq = rfqStore.find((item) => item.id === rfqId);
  if (!rfq) return undefined;

  const newApproval = createQuoteApprovalFromRFQ(rfq);
  quoteApprovalStore.push(newApproval);
  return newApproval;
}

export function updateQuoteApproval(
  id: string,
  updater: (approval: QuoteApproval) => QuoteApproval
): QuoteApproval | undefined {
  const existing = getQuoteApproval(id);
  if (!existing) return undefined;
  const updated = updater(existing);
  saveQuoteApproval(updated);
  return updated;
}

export function logQuoteApprovalAudit(log: AuditLog) {
  quoteApprovalAuditLogs.push(log);
}

export function buildLineItemDecision(
  approval: QuoteApproval,
  mrLineItemId: string,
  selectedQuoteId: string,
  decision: 'approved' | 'rejected',
  comments?: string
): LineItemDecision | undefined {
  const mrLineItem = approval.quote_pack.rfq.material_request.line_items.find((item) => item.id === mrLineItemId);
  const selectedQuote = approval.quote_pack.quotes.find((quote) => quote.id === selectedQuoteId);
  const quoteLineItem = selectedQuote?.line_items.find((item) => item.mr_line_item_id === mrLineItemId);

  if (!mrLineItem || !selectedQuote || !quoteLineItem) {
    return undefined;
  }

  return {
    id: `qad-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    quote_approval_id: approval.id,
    mr_line_item_id: mrLineItemId,
    mr_line_item: mrLineItem,
    selected_quote_id: selectedQuoteId,
    selected_quote: selectedQuote,
    decision,
    comments,
    created_at: new Date().toISOString(),
  };
}
