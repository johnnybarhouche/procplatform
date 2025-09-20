import { AuthorizationMatrix, PurchaseRequisition } from '@/types/procurement';

// Mock authorization matrix data - in production this would come from database
const authorizationMatrix: AuthorizationMatrix[] = [
  {
    id: 'am-001',
    project_id: '1',
    approval_level: 1,
    threshold_min: 0,
    threshold_max: 5000,
    approver_role: 'procurement',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'am-002',
    project_id: '1',
    approval_level: 2,
    threshold_min: 5000,
    threshold_max: 25000,
    approver_role: 'approver',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'am-003',
    project_id: '1',
    approval_level: 3,
    threshold_min: 25000,
    threshold_max: 100000,
    approver_role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function getAuthorizationMatrix(projectId: string): AuthorizationMatrix[] {
  return authorizationMatrix.filter(am => am.project_id === projectId && am.is_active);
}

export function getRequiredApprovalLevels(projectId: string, totalValue: number): AuthorizationMatrix[] {
  const matrix = getAuthorizationMatrix(projectId);
  return matrix.filter(am => totalValue >= am.threshold_min && totalValue < am.threshold_max);
}

export function getNextApprovalLevel(pr: PurchaseRequisition): number {
  // const matrix = getAuthorizationMatrix(pr.project_id);
  const requiredLevels = getRequiredApprovalLevels(pr.project_id, pr.total_value);
  
  if (requiredLevels.length === 0) {
    return 0; // No approval required
  }
  
  // Find the highest approval level that hasn't been completed
  const completedLevels = pr.approvals
    .filter(approval => approval.status === 'approved')
    .map(approval => approval.approval_level);
  
  const maxCompletedLevel = completedLevels.length > 0 ? Math.max(...completedLevels) : 0;
  const maxRequiredLevel = Math.max(...requiredLevels.map(am => am.approval_level));
  
  if (maxCompletedLevel >= maxRequiredLevel) {
    return 0; // All approvals completed
  }
  
  return maxCompletedLevel + 1;
}

export function isPRFullyApproved(pr: PurchaseRequisition): boolean {
  const requiredLevels = getRequiredApprovalLevels(pr.project_id, pr.total_value);
  if (requiredLevels.length === 0) {
    return true; // No approval required
  }
  
  const maxRequiredLevel = Math.max(...requiredLevels.map(am => am.approval_level));
  const approvedLevels = pr.approvals
    .filter(approval => approval.status === 'approved')
    .map(approval => approval.approval_level);
  
  return approvedLevels.length > 0 && Math.max(...approvedLevels) >= maxRequiredLevel;
}

export function getApproversForLevel(projectId: string, approvalLevel: number): string[] {
  const matrix = getAuthorizationMatrix(projectId);
  const levelMatrix = matrix.filter(am => am.approval_level === approvalLevel);
  
  // In a real implementation, this would return actual user IDs
  // For MVP, we'll return role-based approvers
  return levelMatrix.map(am => am.approver_role);
}
