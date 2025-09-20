import { PurchaseRequisition, PRApproval } from '@/types/procurement';

export interface NotificationTemplate {
  subject: string;
  body: string;
  recipients: string[];
}

export class NotificationService {
  private static instance: NotificationService;
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  public async sendPRCreatedNotification(pr: PurchaseRequisition): Promise<void> {
    const template = this.getPRCreatedTemplate(pr);
    await this.sendNotification(template);
  }
  
  public async sendPRStatusChangeNotification(pr: PurchaseRequisition, oldStatus: string): Promise<void> {
    const template = this.getPRStatusChangeTemplate(pr, oldStatus);
    await this.sendNotification(template);
  }
  
  public async sendPRApprovalRequiredNotification(pr: PurchaseRequisition, approvers: string[]): Promise<void> {
    const template = this.getPRApprovalRequiredTemplate(pr, approvers);
    await this.sendNotification(template);
  }
  
  public async sendPRApprovalDecisionNotification(pr: PurchaseRequisition, approval: PRApproval): Promise<void> {
    const template = this.getPRApprovalDecisionTemplate(pr, approval);
    await this.sendNotification(template);
  }
  
  private getPRCreatedTemplate(pr: PurchaseRequisition): NotificationTemplate {
    return {
      subject: `New Purchase Requisition Created: ${pr.pr_number}`,
      body: `
        A new Purchase Requisition has been created:
        
        PR Number: ${pr.pr_number}
        Project: ${pr.project_name}
        Supplier: ${pr.supplier.name}
        Total Value: ${pr.total_value.toLocaleString()} ${pr.currency}
        Status: ${pr.status}
        
        Please review and take necessary action.
      `,
      recipients: ['procurement@company.com', 'approver@company.com']
    };
  }
  
  private getPRStatusChangeTemplate(pr: PurchaseRequisition, oldStatus: string): NotificationTemplate {
    return {
      subject: `Purchase Requisition Status Changed: ${pr.pr_number}`,
      body: `
        Purchase Requisition status has been updated:
        
        PR Number: ${pr.pr_number}
        Project: ${pr.project_name}
        Supplier: ${pr.supplier.name}
        Previous Status: ${oldStatus}
        New Status: ${pr.status}
        Total Value: ${pr.total_value.toLocaleString()} ${pr.currency}
        
        Please review the updated status.
      `,
      recipients: ['procurement@company.com', 'approver@company.com']
    };
  }
  
  private getPRApprovalRequiredTemplate(pr: PurchaseRequisition, approvers: string[]): NotificationTemplate {
    return {
      subject: `Purchase Requisition Approval Required: ${pr.pr_number}`,
      body: `
        A Purchase Requisition requires your approval:
        
        PR Number: ${pr.pr_number}
        Project: ${pr.project_name}
        Supplier: ${pr.supplier.name}
        Total Value: ${pr.total_value.toLocaleString()} ${pr.currency}
        Status: ${pr.status}
        
        Please review and approve or reject this PR.
      `,
      recipients: approvers
    };
  }
  
  private getPRApprovalDecisionTemplate(pr: PurchaseRequisition, approval: PRApproval): NotificationTemplate {
    return {
      subject: `Purchase Requisition Approval Decision: ${pr.pr_number}`,
      body: `
        Purchase Requisition approval decision:
        
        PR Number: ${pr.pr_number}
        Project: ${pr.project_name}
        Supplier: ${pr.supplier.name}
        Decision: ${approval.status}
        Approver: ${approval.approver_name}
        Comments: ${approval.comments || 'None'}
        
        The PR has been ${approval.status}.
      `,
      recipients: ['procurement@company.com', 'requester@company.com']
    };
  }
  
  private async sendNotification(template: NotificationTemplate): Promise<void> {
    // Mock email sending - in production this would integrate with email service
    console.log('📧 Email Notification:', {
      subject: template.subject,
      recipients: template.recipients,
      body: template.body
    });
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export const notificationService = NotificationService.getInstance();
