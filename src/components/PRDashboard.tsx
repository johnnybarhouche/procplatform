'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/components/ui';
import { PurchaseRequisition, PRDashboardProps } from '@/types/procurement';

const STATUS_VARIANTS: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'neutral'> = {
  draft: 'primary',
  submitted: 'primary',
  under_review: 'warning',
  approved: 'success',
  rejected: 'danger',
};

export default function PRDashboard({ userRole }: PRDashboardProps) {
  const [prs, setPRs] = useState<PurchaseRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPRs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage.toString(), limit: '10' });
      if (filterProject !== 'all') params.append('project_id', filterProject);
      if (filterSupplier !== 'all') params.append('supplier_id', filterSupplier);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      const response = await fetch(`/api/prs?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setPRs(data.prs || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error('Error fetching PRs:', data.error);
        setPRs([]);
      }
    } catch (error) {
      console.error('Error fetching PRs:', error);
      setPRs([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterProject, filterSupplier, filterStatus]);

  useEffect(() => {
    fetchPRs();
  }, [fetchPRs, currentPage, filterProject, filterSupplier, filterStatus]);

  const handleStatusChange = async (prId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/prs/${prId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchPRs();
      } else {
        console.error('Error updating PR status');
      }
    } catch (error) {
      console.error('Error updating PR status:', error);
    }
  };

  const filteredPRs = prs.filter((pr) => {
    if (!searchTerm) return true;
    const haystack = `${pr.pr_number} ${pr.supplier.name} ${pr.project_name}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const sortedPRs = [...filteredPRs].sort((a, b) => {
    switch (sortBy) {
      case 'pr_number':
        return a.pr_number.localeCompare(b.pr_number);
      case 'total_value':
        return (b.total_value || 0) - (a.total_value || 0);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-brand-text">Purchase Requisitions</h1>
        <p className="text-brand-text/70">Manage and track requisitions across projects and suppliers.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="space-y-1 text-brand-text">
            <p className="text-sm text-brand-text/60">Total PRs</p>
            <p className="text-2xl font-semibold text-brand-primary">{prs.length}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-1 text-brand-text">
            <p className="text-sm text-brand-text/60">Awaiting Review</p>
            <p className="text-2xl font-semibold text-status-warning">
              {prs.filter((pr) => pr.status === 'under_review').length}
            </p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-1 text-brand-text">
            <p className="text-sm text-brand-text/60">Approved</p>
            <p className="text-2xl font-semibold text-status-success">
              {prs.filter((pr) => pr.status === 'approved').length}
            </p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-1 text-brand-text">
            <p className="text-sm text-brand-text/60">Rejected</p>
            <p className="text-2xl font-semibold text-status-danger">
              {prs.filter((pr) => pr.status === 'rejected').length}
            </p>
          </div>
        </Card>
      </div>

      <Card header="Filters">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Select label="Project" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
            <option value="all">All Projects</option>
            <option value="1">Project Alpha</option>
            <option value="2">Project Beta</option>
          </Select>
          <Select label="Supplier" value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)}>
            <option value="all">All Suppliers</option>
            <option value="supplier-001">ABC Construction Supplies</option>
          </Select>
          <Select label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
          <Select label="Sort By" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_at">Created Date</option>
            <option value="pr_number">PR Number</option>
            <option value="total_value">Total Value</option>
            <option value="status">Status</option>
          </Select>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Input
            label="Search"
            placeholder="PR number, supplier, or project"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex items-end gap-2">
            <Button type="button" variant="ghost" onClick={() => { setFilterProject('all'); setFilterSupplier('all'); setFilterStatus('all'); setSortBy('created_at'); setSearchTerm(''); setCurrentPage(1); }}>
              Reset
            </Button>
            <Button type="button" onClick={fetchPRs} variant="secondary">
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      <Card header="Purchase Requisitions">
        {sortedPRs.length === 0 ? (
          <div className="py-12 text-center text-brand-text/60">No purchase requisitions found.</div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>PR Number</TableHeaderCell>
                <TableHeaderCell>Project</TableHeaderCell>
                <TableHeaderCell>Supplier</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Total (AED)</TableHeaderCell>
                <TableHeaderCell>Created</TableHeaderCell>
                {userRole === 'admin' && <TableHeaderCell className="text-right">Actions</TableHeaderCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPRs.map((pr) => (
                <TableRow key={pr.id}>
                  <TableCell>
                    <div className="font-semibold text-brand-text">{pr.pr_number}</div>
                    <div className="text-xs text-brand-text/60">{pr.project_name}</div>
                  </TableCell>
                  <TableCell className="text-sm text-brand-text/80">{pr.project_name}</TableCell>
                  <TableCell className="text-sm text-brand-text/80">{pr.supplier.name}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[pr.status] || 'neutral'}>
                      {pr.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-brand-text/80">
                    {(pr.total_value || 0).toLocaleString()} AED
                  </TableCell>
                  <TableCell className="text-sm text-brand-text/70">
                    {new Date(pr.created_at).toLocaleDateString()}
                  </TableCell>
                  {userRole === 'admin' && (
                    <TableCell className="text-right">
                      <Select
                        value={pr.status}
                        onChange={(e) => handleStatusChange(pr.id, e.target.value)}
                        className="w-40"
                      >
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </Select>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="flex items-center justify-between text-sm text-brand-text/70">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
