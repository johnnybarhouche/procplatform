// Database utilities for Material Request system
// In a real implementation, this would use Supabase client or Prisma

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'requester' | 'procurement' | 'approver' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface MaterialRequest {
  id: string;
  mrn: string;
  projectId: string;
  createdBy: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface MRLineItem {
  id: string;
  mrId: string;
  itemCode: string;
  description: string;
  uom: string;
  quantity: number;
  remarks?: string;
  location?: string;
  brandAsset?: string;
  serialChassisEngineNo?: string;
  modelYear?: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  mrId: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeData?: unknown;
  afterData?: unknown;
  timestamp: string;
}

// Mock database for MVP - in production, this would be Supabase/PostgreSQL
class MockDatabase {
  private projects: Project[] = [
    {
      id: '1',
      name: 'Project Alpha',
      description: 'Main project for procurement system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Project Beta',
      description: 'Secondary project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  private users: User[] = [
    {
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User',
      role: 'requester',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  private materialRequests: MaterialRequest[] = [];
  private mrLineItems: MRLineItem[] = [];
  private attachments: Attachment[] = [];
  private auditLogs: AuditLog[] = [];

  // Project operations
  async getProjects(): Promise<Project[]> {
    return [...this.projects];
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projects.find(p => p.id === id) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  // Material Request operations
  async createMaterialRequest(data: {
    projectId: string;
    createdBy: string;
    lineItems: Omit<MRLineItem, 'id' | 'mrId' | 'createdAt'>[];
    attachments?: Omit<Attachment, 'id' | 'mrId' | 'uploadedAt'>[];
  }): Promise<MaterialRequest> {
    const mrn = `MR-${Date.now()}`;
    const mr: MaterialRequest = {
      id: `mr-${Date.now()}`,
      mrn,
      projectId: data.projectId,
      createdBy: data.createdBy,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.materialRequests.push(mr);

    // Create line items
    const lineItems = data.lineItems.map(item => ({
      ...item,
      id: `line-${Date.now()}-${Math.random()}`,
      mrId: mr.id,
      createdAt: new Date().toISOString()
    }));
    this.mrLineItems.push(...lineItems);

    // Create attachments if any
    if (data.attachments) {
      const attachmentRecords = data.attachments.map(attachment => ({
        ...attachment,
        id: `att-${Date.now()}-${Math.random()}`,
        mrId: mr.id,
        uploadedAt: new Date().toISOString()
      }));
      this.attachments.push(...attachmentRecords);
    }

    // Create audit log
    const auditLog: AuditLog = {
      id: `audit-${Date.now()}`,
      actorId: data.createdBy,
      action: 'CREATE_MR',
      entityType: 'MaterialRequest',
      entityId: mr.id,
      beforeData: null,
      afterData: mr,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.push(auditLog);

    return mr;
  }

  async getMaterialRequests(): Promise<MaterialRequest[]> {
    return [...this.materialRequests];
  }

  async getMaterialRequestById(id: string): Promise<MaterialRequest | null> {
    return this.materialRequests.find(mr => mr.id === id) || null;
  }

  async getMRLineItems(mrId: string): Promise<MRLineItem[]> {
    return this.mrLineItems.filter(item => item.mrId === mrId);
  }

  async getMRAttachments(mrId: string): Promise<Attachment[]> {
    return this.attachments.filter(attachment => attachment.mrId === mrId);
  }

  // Audit log operations
  async getAuditLogs(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.auditLogs.filter(log => 
      log.entityType === entityType && log.entityId === entityId
    );
  }
}

// Export singleton instance
export const db = new MockDatabase();
