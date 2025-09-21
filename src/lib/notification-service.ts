import {
  PurchaseRequisition,
  PRApproval,
  PurchaseOrder,
  Supplier,
  RFQ,
  RFQSupplier,
} from '@/types/procurement';

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

  // RFQ notification methods
  public async sendRFQDispatchNotification(
    rfq: RFQ,
    supplier: RFQSupplier,
    packetSummary: { lineItemCount: number; dueDate?: string; terms?: string }
  ): Promise<void> {
    const template = this.getRFQDispatchTemplate(rfq, supplier, packetSummary);
    await this.sendNotification(template);
  }
  
  // PO notification methods
  public async sendPOCreatedNotification(po: PurchaseOrder): Promise<void> {
    const template = this.getPOCreatedTemplate(po);
    await this.sendNotification(template);
  }
  
  public async sendPOStatusChangeNotification(po: PurchaseOrder, oldStatus: string): Promise<void> {
    const template = this.getPOStatusChangeTemplate(po, oldStatus);
    await this.sendNotification(template);
  }
  
  public async sendPOSentToSupplierNotification(po: PurchaseOrder): Promise<void> {
    const template = this.getPOSentToSupplierTemplate(po);
    await this.sendNotification(template);
  }
  
  public async sendPOSupplierAcknowledgmentNotification(po: PurchaseOrder): Promise<void> {
    const template = this.getPOSupplierAcknowledgmentTemplate(po);
    await this.sendNotification(template);
  }

  // Supplier notification methods
  public async sendSupplierCreatedNotification(supplier: Supplier): Promise<void> {
    const template = this.getSupplierCreatedTemplate(supplier);
    await this.sendNotification(template);
  }

  public async sendSupplierApprovalNotification(supplier: Supplier): Promise<void> {
    const template = this.getSupplierApprovalTemplate(supplier);
    await this.sendNotification(template);
  }

  public async sendSupplierStatusChangeNotification(supplier: Supplier, oldStatus: string): Promise<void> {
    const template = this.getSupplierStatusChangeTemplate(supplier, oldStatus);
    await this.sendNotification(template);
  }

  public async sendSupplierComplianceExpiryNotification(supplier: Supplier, expiringDocs: string[]): Promise<void> {
    const template = this.getSupplierComplianceExpiryTemplate(supplier, expiringDocs);
    await this.sendNotification(template);
  }

  public async sendSupplierPerformanceAlertNotification(supplier: Supplier, alertType: string): Promise<void> {
    const template = this.getSupplierPerformanceAlertTemplate(supplier, alertType);
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
  
  // PO notification templates
  private getPOCreatedTemplate(po: PurchaseOrder): NotificationTemplate {
    return {
      subject: `New Purchase Order Created: ${po.po_number}`,
      body: `
        A new Purchase Order has been created:
        
        PO Number: ${po.po_number}
        Project: ${po.project_name}
        Supplier: ${po.supplier.name}
        Total Value: ${po.total_value.toLocaleString()} ${po.currency}
        Status: ${po.status}
        Delivery Address: ${po.delivery_address}
        Payment Terms: ${po.payment_terms}
        
        Please review and take necessary action.
      `,
      recipients: ['procurement@company.com', 'supplier@company.com']
    };
  }
  
  private getPOStatusChangeTemplate(po: PurchaseOrder, oldStatus: string): NotificationTemplate {
    return {
      subject: `Purchase Order Status Changed: ${po.po_number}`,
      body: `
        Purchase Order status has been updated:
        
        PO Number: ${po.po_number}
        Project: ${po.project_name}
        Supplier: ${po.supplier.name}
        Previous Status: ${oldStatus}
        New Status: ${po.status}
        Total Value: ${po.total_value.toLocaleString()} ${po.currency}
        
        Please review the updated status.
      `,
      recipients: ['procurement@company.com', 'supplier@company.com']
    };
  }
  
  private getPOSentToSupplierTemplate(po: PurchaseOrder): NotificationTemplate {
    return {
      subject: `Purchase Order Sent: ${po.po_number}`,
      body: `
        Purchase Order has been sent to supplier:
        
        PO Number: ${po.po_number}
        Project: ${po.project_name}
        Supplier: ${po.supplier.name}
        Total Value: ${po.total_value.toLocaleString()} ${po.currency}
        Delivery Address: ${po.delivery_address}
        Payment Terms: ${po.payment_terms}
        
        Please acknowledge receipt and provide delivery timeline.
      `,
      recipients: [po.supplier.email, 'procurement@company.com']
    };
  }
  
  private getPOSupplierAcknowledgmentTemplate(po: PurchaseOrder): NotificationTemplate {
    return {
      subject: `Purchase Order Acknowledged: ${po.po_number}`,
      body: `
        Purchase Order has been acknowledged by supplier:
        
        PO Number: ${po.po_number}
        Project: ${po.project_name}
        Supplier: ${po.supplier.name}
        Acknowledged By: ${po.acknowledged_by_name}
        Acknowledged At: ${po.acknowledged_at}
        Delivery Date: ${po.delivery_date || 'TBD'}
        
        The supplier has confirmed receipt and is processing the order.
      `,
      recipients: ['procurement@company.com', 'project@company.com']
    };
  }

  // Supplier notification templates
  private getSupplierCreatedTemplate(supplier: Supplier): NotificationTemplate {
    return {
      subject: `New Supplier Registered: ${supplier.name}`,
      body: `
        A new supplier has been registered and requires approval:

        Supplier Name: ${supplier.name}
        Email: ${supplier.email}
        Phone: ${supplier.phone || 'N/A'}
        Category: ${supplier.category}
        Address: ${supplier.address || 'N/A'}
        Status: ${supplier.status}
        Created By: ${supplier.created_by_name}
        Created At: ${supplier.created_at}

        Please review and approve this supplier for active use.
      `,
      recipients: ['procurement@company.com', 'admin@company.com']
    };
  }

  private getSupplierApprovalTemplate(supplier: Supplier): NotificationTemplate {
    return {
      subject: `Supplier Approved: ${supplier.name}`,
      body: `
        Supplier has been approved for active use:

        Supplier Name: ${supplier.name}
        Email: ${supplier.email}
        Category: ${supplier.category}
        Approved By: ${supplier.approved_by_name}
        Approval Date: ${supplier.approval_date}
        Approval Notes: ${supplier.approval_notes || 'N/A'}

        The supplier is now available for procurement activities.
      `,
      recipients: [supplier.email, 'procurement@company.com']
    };
  }

  private getSupplierStatusChangeTemplate(supplier: Supplier, oldStatus: string): NotificationTemplate {
    return {
      subject: `Supplier Status Changed: ${supplier.name}`,
      body: `
        Supplier status has been updated:

        Supplier Name: ${supplier.name}
        Previous Status: ${oldStatus}
        New Status: ${supplier.status}
        Category: ${supplier.category}
        Updated At: ${supplier.updated_at}

        Please review the updated status and take necessary action.
      `,
      recipients: ['procurement@company.com', supplier.email]
    };
  }

  private getSupplierComplianceExpiryTemplate(supplier: Supplier, expiringDocs: string[]): NotificationTemplate {
    return {
      subject: `Compliance Documents Expiring: ${supplier.name}`,
      body: `
        The following compliance documents for ${supplier.name} are expiring soon:

        Expiring Documents:
        ${expiringDocs.map(doc => `- ${doc}`).join('\n')}

        Supplier Details:
        Name: ${supplier.name}
        Email: ${supplier.email}
        Category: ${supplier.category}

        Please contact the supplier to renew these documents.
      `,
      recipients: ['procurement@company.com', 'compliance@company.com']
    };
  }

  private getSupplierPerformanceAlertTemplate(supplier: Supplier, alertType: string): NotificationTemplate {
    return {
      subject: `Supplier Performance Alert: ${supplier.name}`,
      body: `
        Performance alert for supplier:

        Supplier Name: ${supplier.name}
        Alert Type: ${alertType}
        Category: ${supplier.category}
        
        Performance Metrics:
        - Total Quotes: ${supplier.performance_metrics.total_quotes}
        - Success Rate: ${supplier.performance_metrics.total_quotes > 0 
          ? ((supplier.performance_metrics.successful_quotes / supplier.performance_metrics.total_quotes) * 100).toFixed(1)
          : 0}%
        - Average Response Time: ${supplier.performance_metrics.avg_response_time_hours} hours
        - On-Time Delivery Rate: ${supplier.performance_metrics.on_time_delivery_rate}%
        - Quality Rating: ${supplier.performance_metrics.quality_rating}/5.0
        - Communication Rating: ${supplier.performance_metrics.communication_rating}/5.0

        Please review the supplier's performance and take appropriate action.
      `,
      recipients: ['procurement@company.com', 'management@company.com']
    };
  }

  private getRFQDispatchTemplate(
    rfq: RFQ,
    supplier: RFQSupplier,
    packetSummary: { lineItemCount: number; dueDate?: string; terms?: string }
  ): NotificationTemplate {
    const supplierName = supplier.supplier?.name ?? supplier.supplier_id ?? 'Supplier';
    const recipient = supplier.supplier?.email ?? supplier.portal_link ?? 'procurement@company.com';

    return {
      subject: `RFQ ${rfq.rfq_number} Dispatched for ${rfq.material_request.project_name}`,
      body: `
Hello ${supplierName},

You have been invited to quote for Material Request ${rfq.material_request.mrn}.

Project: ${rfq.material_request.project_name}
RFQ Number: ${rfq.rfq_number}
Line Items: ${packetSummary.lineItemCount}
Due Date: ${packetSummary.dueDate ?? 'Not specified'}
Terms & Instructions: ${packetSummary.terms ?? 'Standard procurement terms apply.'}

Please review the request and respond before the due date. This message was automatically generated by the procurement platform.

Best regards,
Procurement Team
      `,
      recipients: [recipient, 'procurement@company.com'],
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
