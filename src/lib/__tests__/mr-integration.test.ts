import { db } from '../database';

describe('Material Request Integration Tests', () => {
  beforeEach(() => {
    // Reset database state before each test
    jest.clearAllMocks();
  });

  it('creates a complete material request with line items and attachments', async () => {
    const mrData = {
      projectId: '1',
      createdBy: 'user-123',
      lineItems: [
        {
          itemCode: 'ITEM001',
          description: 'Test Item 1',
          uom: 'PCS',
          quantity: 5,
          remarks: 'Test remarks',
          location: 'Warehouse A',
          brandAsset: 'Brand X',
          serialChassisEngineNo: 'SN123',
          modelYear: '2024'
        },
        {
          itemCode: 'ITEM002',
          description: 'Test Item 2',
          uom: 'KG',
          quantity: 10,
          remarks: '',
          location: '',
          brandAsset: '',
          serialChassisEngineNo: '',
          modelYear: ''
        }
      ],
      attachments: [
        {
          fileName: 'test.pdf',
          fileUrl: 'https://mock-storage.com/test.pdf',
          fileType: 'application/pdf'
        }
      ]
    };

    const mr = await db.createMaterialRequest(mrData);

    expect(mr).toBeDefined();
    expect(mr.id).toBeDefined();
    expect(mr.mrn).toMatch(/^MR-\d+$/);
    expect(mr.projectId).toBe('1');
    expect(mr.status).toBe('submitted');

    // Verify line items were created
    const lineItems = await db.getMRLineItems(mr.id);
    expect(lineItems).toHaveLength(2);
    expect(lineItems[0].itemCode).toBe('ITEM001');
    expect(lineItems[1].itemCode).toBe('ITEM002');

    // Verify attachments were created
    const attachments = await db.getMRAttachments(mr.id);
    expect(attachments).toHaveLength(1);
    expect(attachments[0].fileName).toBe('test.pdf');

    // Verify audit log was created
    const auditLogs = await db.getAuditLogs('MaterialRequest', mr.id);
    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0].action).toBe('CREATE_MR');
  });

  it('handles material request creation without attachments', async () => {
    const mrData = {
      projectId: '1',
      createdBy: 'user-123',
      lineItems: [
        {
          itemCode: 'ITEM001',
          description: 'Test Item',
          uom: 'PCS',
          quantity: 1,
          remarks: '',
          location: '',
          brandAsset: '',
          serialChassisEngineNo: '',
          modelYear: ''
        }
      ]
    };

    const mr = await db.createMaterialRequest(mrData);

    expect(mr).toBeDefined();
    expect(mr.status).toBe('submitted');

    const attachments = await db.getMRAttachments(mr.id);
    expect(attachments).toHaveLength(0);
  });

  it('retrieves all material requests', async () => {
    // Create multiple MRs
    await db.createMaterialRequest({
      projectId: '1',
      createdBy: 'user-123',
      lineItems: [{ itemCode: 'ITEM001', description: 'Item 1', uom: 'PCS', quantity: 1, remarks: '', location: '', brandAsset: '', serialChassisEngineNo: '', modelYear: '' }]
    });

    await db.createMaterialRequest({
      projectId: '2',
      createdBy: 'user-123',
      lineItems: [{ itemCode: 'ITEM002', description: 'Item 2', uom: 'PCS', quantity: 2, remarks: '', location: '', brandAsset: '', serialChassisEngineNo: '', modelYear: '' }]
    });

    const allMRs = await db.getMaterialRequests();
    expect(allMRs.length).toBeGreaterThanOrEqual(2);
  });

  it('generates unique MRNs for different material requests', async () => {
    const mr1 = await db.createMaterialRequest({
      projectId: '1',
      createdBy: 'user-123',
      lineItems: [{ itemCode: 'ITEM001', description: 'Item 1', uom: 'PCS', quantity: 1, remarks: '', location: '', brandAsset: '', serialChassisEngineNo: '', modelYear: '' }]
    });

    const mr2 = await db.createMaterialRequest({
      projectId: '1',
      createdBy: 'user-123',
      lineItems: [{ itemCode: 'ITEM002', description: 'Item 2', uom: 'PCS', quantity: 1, remarks: '', location: '', brandAsset: '', serialChassisEngineNo: '', modelYear: '' }]
    });

    expect(mr1.mrn).not.toBe(mr2.mrn);
    expect(mr1.mrn).toMatch(/^MR-\d+$/);
    expect(mr2.mrn).toMatch(/^MR-\d+$/);
  });
});

