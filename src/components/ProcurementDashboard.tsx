"use client";

import React, { useEffect, useState } from "react";
import { MaterialRequest, RFQ, Supplier } from "@/types/procurement";
import {
  Badge,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui";
import { PageLayout } from "@/components/layout/PageLayout";
import RFQWizard from "@/components/RFQWizard";
import ComparisonGrid from "@/components/ComparisonGrid";
import { ComparisonSummary } from "@/types/procurement";

interface ProcurementDashboardProps {
  userRole: "procurement" | "admin";
}

export default function ProcurementDashboard({}: ProcurementDashboardProps) {
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [activeRFQ, setActiveRFQ] = useState<MaterialRequest | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [comparisonRFQ, setComparisonRFQ] = useState<RFQ | null>(null);
  const [comparisonSummary, setComparisonSummary] = useState<ComparisonSummary | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mrsResponse, suppliersResponse] = await Promise.all([
        fetch("/api/mrs"),
        fetch("/api/suppliers"),
      ]);

      const [mrsData, suppliersData] = await Promise.all([
        mrsResponse.json(),
        suppliersResponse.json(),
      ]);

      const mrs = mrsData.mrs || mrsData;
      const suppliersResult = Array.isArray(suppliersData?.suppliers)
        ? suppliersData.suppliers
        : Array.isArray(suppliersData)
          ? suppliersData
          : [];

      setMaterialRequests(Array.isArray(mrs) ? mrs : []);
      setSuppliers(suppliersResult);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWizard = (mr: MaterialRequest) => {
    setActiveRFQ(mr);
    setIsWizardOpen(true);
    setFeedback(null);
  };

  const handleRFQCreated = (rfq: RFQ) => {
    setFeedback(`RFQ ${rfq.rfq_number} dispatched to ${rfq.suppliers.length} supplier(s).`);
    setMaterialRequests((current) =>
      current.map((mr) =>
        mr.id === rfq.material_request_id
          ? { ...mr, status: mr.status === "submitted" ? "in_progress" : mr.status }
          : mr
      )
    );
    setIsWizardOpen(false);
    setActiveRFQ(null);
  };

  const handleOpenComparison = async (mr: MaterialRequest) => {
    setComparisonLoading(true);
    setComparisonError(null);
    setComparisonRFQ(null);
    try {
      const response = await fetch(`/api/rfqs?material_request_id=${mr.id}`);
      if (!response.ok) {
        throw new Error('Unable to load RFQ comparison data');
      }
      const data = (await response.json()) as { rfqs: RFQ[] };
      const rfq = data.rfqs?.[0];
      if (!rfq) {
        setComparisonError('No RFQ data found for this material request yet.');
        return;
      }
      setComparisonRFQ(rfq);
      setComparisonSummary(rfq.comparison_summary ?? null);
    } catch (error) {
      console.error(error);
      setComparisonError('Failed to load comparison data. Please try again later.');
    } finally {
      setComparisonLoading(false);
    }
  };

  const handleComparisonSaved = (summary: ComparisonSummary) => {
    setComparisonSummary(summary);
    setFeedback(`Selections recorded for RFQ ${summary.rfq_number}.`);
  };

  const filteredMRs = (materialRequests || []).filter((mr) => {
    if (filterStatus === "all") return true;
    return mr.status === filterStatus;
  });

  const sortedMRs = [...filteredMRs].sort((a, b) => {
    switch (sortBy) {
      case "created_at":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "project":
        return a.project_name.localeCompare(b.project_name);
      case "requester":
        return a.requester_name.localeCompare(b.requester_name);
      default:
        return 0;
    }
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "submitted":
        return "primary" as const;
      case "in_progress":
        return "warning" as const;
      case "approved":
        return "success" as const;
      case "rejected":
        return "danger" as const;
      default:
        return "neutral" as const;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-primary" />
      </div>
    );
  }

  return (
    <>
      <PageLayout 
        title="Procurement Dashboard"
        description="Manage Material Requests and RFQ processes"
      >

        {feedback && (
          <div className="rounded-lg border border-status-success/40 bg-status-success/10 px-4 py-3 text-sm text-status-success">
            {feedback}
          </div>
        )}

        {comparisonError && (
          <div className="rounded-lg border border-status-warning/40 bg-status-warning/10 px-4 py-3 text-sm text-status-warning">
            {comparisonError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card
            className="lg:col-span-2"
            header="Material Requests Inbox"
            actions={
              <div className="flex gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-md border border-brand-text/20 bg-brand-surface px-3 py-2 text-sm text-brand-text focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-brand-text/20 bg-brand-surface px-3 py-2 text-sm text-brand-text focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="created_at">Sort by Date</option>
                  <option value="project">Sort by Project</option>
                  <option value="requester">Sort by Requester</option>
                </select>
              </div>
            }
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Request</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Requester</TableHeaderCell>
                  <TableHeaderCell>Line Items</TableHeaderCell>
                  <TableHeaderCell>Total (AED)</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedMRs.map((mr) => (
                  <TableRow key={mr.id}>
                    <TableCell>
                      <div className="font-semibold text-brand-text">MR-{mr.mrn}</div>
                      <div className="text-xs text-brand-text/60">{mr.project_name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(mr.status)}>
                        {mr.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-brand-text">{mr.requester_name}</div>
                      <div className="text-xs text-brand-text/60">{new Date(mr.created_at).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>{mr.line_items.length}</TableCell>
                    <TableCell>
                      {mr.line_items
                        .reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
                        .toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenComparison(mr)}
                          disabled={comparisonLoading}
                        >
                          Compare quotes
                        </Button>
                        {mr.status === "submitted" && (
                          <Button variant="primary" size="sm" onClick={() => handleOpenWizard(mr)}>
                            Create RFQ
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card
            header="Supplier Suggestions"
            className="lg:col-span-1"
            actions={<span className="text-xs text-brand-text/60">Historical suppliers and pricing</span>}
          >
            <div className="space-y-4">
              {(suppliers || []).slice(0, 5).map((supplier) => (
                <Card key={supplier.id} header={supplier.name} className="border-brand-text/15">
                  <div className="flex items-start justify-between text-sm">
                    <div className="space-y-1">
                      <p className="text-brand-text/70">{supplier.category}</p>
                      <p className="text-xs text-brand-text/50">Avg response {supplier.avg_response_time}h</p>
                      <p className="text-xs text-brand-text/50">
                        Last quote {new Date(supplier.last_quote_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-status-success">{supplier.rating}/5.0</div>
                      <div className="text-xs text-brand-text/50">{supplier.quote_count} quotes</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {comparisonSummary && (
          <Card
            className="border-brand-text/10"
            header={`Latest comparison summary — RFQ ${comparisonSummary.rfq_number}`}
            actions={<span className="text-xs text-brand-text/60">Generated {new Date(comparisonSummary.generated_at).toLocaleString()}</span>}
          >
            <div className="space-y-2 text-sm text-brand-text/70">
              {comparisonSummary.selections.map((selection) => (
                <div key={selection.line_item_id} className="flex items-center justify-between gap-4 border-b border-brand-text/10 pb-2 last:border-b-0">
                  <div>
                    <p className="font-medium text-brand-text">{selection.line_description}</p>
                    <p className="text-xs text-brand-text/50">{selection.supplier_name}</p>
                  </div>
                  <div className="text-right">
                    <p>AED {selection.total_price.toFixed(2)}</p>
                    {selection.savings !== 0 && (
                      <p className={selection.savings > 0 ? 'text-status-success text-xs' : 'text-status-warning text-xs'}>
                        {selection.savings > 0 ? `Saving AED ${selection.savings.toFixed(2)}` : `+AED ${Math.abs(selection.savings).toFixed(2)} vs best`}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </PageLayout>

      {isWizardOpen && activeRFQ && (
        <RFQWizard
          materialRequest={activeRFQ}
          suppliers={suppliers}
          onClose={() => {
            setIsWizardOpen(false);
            setActiveRFQ(null);
          }}
          onCreated={handleRFQCreated}
        />
      )}

      {comparisonLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="rounded-lg bg-brand-surface px-6 py-4 text-sm text-brand-text shadow-lg">
            Loading comparison data…
          </div>
        </div>
      )}

      {comparisonRFQ && (
        <ComparisonGrid
          rfq={comparisonRFQ}
          onClose={() => setComparisonRFQ(null)}
          onSaveSelections={handleComparisonSaved}
        />
      )}
    </>
  );
}
