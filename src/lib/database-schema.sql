-- Material Request Database Schema
-- This is the SQL schema for PostgreSQL with Supabase

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('requester', 'procurement', 'approver', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Requests table
CREATE TABLE material_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mrn VARCHAR(50) UNIQUE NOT NULL, -- Material Request Number
    project_id UUID NOT NULL REFERENCES projects(id),
    created_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Request Line Items table
CREATE TABLE mr_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mr_id UUID NOT NULL REFERENCES material_requests(id) ON DELETE CASCADE,
    item_code VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    uom VARCHAR(20) NOT NULL, -- Unit of Measure
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    remarks TEXT,
    location VARCHAR(255),
    brand_asset VARCHAR(255),
    serial_chassis_engine_no VARCHAR(255),
    model_year VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachments table
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mr_id UUID NOT NULL REFERENCES material_requests(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    before_data JSONB,
    after_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quote Approvals table
CREATE TABLE quote_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_pack_id UUID NOT NULL REFERENCES quote_packs(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    approved_by_name VARCHAR(255),
    comments TEXT
);

-- Line Item Decisions table
CREATE TABLE line_item_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_approval_id UUID NOT NULL REFERENCES quote_approvals(id) ON DELETE CASCADE,
    mr_line_item_id UUID NOT NULL REFERENCES mr_line_items(id),
    selected_quote_id UUID NOT NULL REFERENCES quotes(id),
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('approved', 'rejected')),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Requisitions table
CREATE TABLE purchase_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_number VARCHAR(50) UNIQUE NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
    total_value DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'AED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    rejected_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    comments TEXT,
    quote_approval_id UUID NOT NULL REFERENCES quote_approvals(id)
);

-- PR Line Items table
CREATE TABLE pr_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id UUID NOT NULL REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    mr_line_item_id UUID NOT NULL REFERENCES mr_line_items(id),
    quote_id UUID NOT NULL REFERENCES quotes(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    lead_time_days INTEGER,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PR Approvals table
CREATE TABLE pr_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id UUID NOT NULL REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES users(id),
    approval_level INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Authorization Matrix table
CREATE TABLE authorization_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id),
    approval_level INTEGER NOT NULL,
    threshold_min DECIMAL(15,2) NOT NULL,
    threshold_max DECIMAL(15,2) NOT NULL,
    approver_role VARCHAR(50) NOT NULL,
    approver_user_id UUID REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_material_requests_project_id ON material_requests(project_id);
CREATE INDEX idx_material_requests_created_by ON material_requests(created_by);
CREATE INDEX idx_material_requests_status ON material_requests(status);
CREATE INDEX idx_mr_line_items_mr_id ON mr_line_items(mr_id);
CREATE INDEX idx_attachments_mr_id ON attachments(mr_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_quote_approvals_status ON quote_approvals(status);
CREATE INDEX idx_quote_approvals_quote_pack_id ON quote_approvals(quote_pack_id);
CREATE INDEX idx_line_item_decisions_approval_id ON line_item_decisions(quote_approval_id);

-- PR-related indexes
CREATE INDEX idx_purchase_requisitions_project_id ON purchase_requisitions(project_id);
CREATE INDEX idx_purchase_requisitions_supplier_id ON purchase_requisitions(supplier_id);
CREATE INDEX idx_purchase_requisitions_status ON purchase_requisitions(status);
CREATE INDEX idx_purchase_requisitions_created_by ON purchase_requisitions(created_by);
CREATE INDEX idx_purchase_requisitions_quote_approval_id ON purchase_requisitions(quote_approval_id);
CREATE INDEX idx_pr_line_items_pr_id ON pr_line_items(pr_id);
CREATE INDEX idx_pr_line_items_mr_line_item_id ON pr_line_items(mr_line_item_id);
CREATE INDEX idx_pr_line_items_quote_id ON pr_line_items(quote_id);
CREATE INDEX idx_pr_approvals_pr_id ON pr_approvals(pr_id);
CREATE INDEX idx_pr_approvals_approver_id ON pr_approvals(approver_id);
CREATE INDEX idx_pr_approvals_status ON pr_approvals(status);
CREATE INDEX idx_authorization_matrix_project_id ON authorization_matrix(project_id);
CREATE INDEX idx_authorization_matrix_threshold ON authorization_matrix(threshold_min, threshold_max);

-- Row Level Security (RLS) policies
ALTER TABLE material_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mr_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see MRs from their projects
CREATE POLICY "Users can view MRs from their projects" ON material_requests
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM projects p 
            WHERE p.id IN (
                -- Add project membership logic here based on your business rules
                SELECT project_id FROM user_project_memberships WHERE user_id = auth.uid()
            )
        )
    );

-- RLS Policy: Users can create MRs for their projects
CREATE POLICY "Users can create MRs for their projects" ON material_requests
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT p.id FROM projects p 
            WHERE p.id IN (
                SELECT project_id FROM user_project_memberships WHERE user_id = auth.uid()
            )
        )
    );

-- RLS Policy: Line items inherit MR permissions
CREATE POLICY "Line items inherit MR permissions" ON mr_line_items
    FOR ALL USING (
        mr_id IN (
            SELECT id FROM material_requests 
            WHERE project_id IN (
                SELECT project_id FROM user_project_memberships WHERE user_id = auth.uid()
            )
        )
    );

-- RLS Policy: Attachments inherit MR permissions
CREATE POLICY "Attachments inherit MR permissions" ON attachments
    FOR ALL USING (
        mr_id IN (
            SELECT id FROM material_requests 
            WHERE project_id IN (
                SELECT project_id FROM user_project_memberships WHERE user_id = auth.uid()
            )
        )
    );

-- Function to generate MRN (Material Request Number)
CREATE OR REPLACE FUNCTION generate_mrn(project_prefix VARCHAR(10))
RETURNS VARCHAR(50) AS $$
DECLARE
    next_number INTEGER;
    mrn VARCHAR(50);
BEGIN
    -- Get the next sequence number for this project
    SELECT COALESCE(MAX(CAST(SUBSTRING(mrn FROM LENGTH(project_prefix) + 2) AS INTEGER)), 0) + 1
    INTO next_number
    FROM material_requests
    WHERE mrn LIKE project_prefix || '-%';
    
    -- Format as PROJECT-001, PROJECT-002, etc.
    mrn := project_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN mrn;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate MRN on insert
CREATE OR REPLACE FUNCTION set_mrn()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.mrn IS NULL OR NEW.mrn = '' THEN
        -- Get project prefix (you might want to store this in projects table)
        NEW.mrn := generate_mrn('MR');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_mrn
    BEFORE INSERT ON material_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_mrn();

-- Purchase Orders table
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'acknowledged', 'in_progress', 'delivered', 'invoiced', 'paid')),
    total_value DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'AED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    invoiced_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    sent_by UUID REFERENCES users(id),
    acknowledged_by VARCHAR(100),
    delivery_date DATE,
    invoice_number VARCHAR(100),
    payment_terms TEXT NOT NULL DEFAULT 'Net 30',
    delivery_address TEXT NOT NULL,
    comments TEXT,
    pr_id UUID NOT NULL REFERENCES purchase_requisitions(id)
);

-- PO Line Items table
CREATE TABLE po_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    pr_line_item_id UUID NOT NULL REFERENCES pr_line_items(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    delivery_date DATE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PO Status History table
CREATE TABLE po_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    previous_status VARCHAR(20),
    changed_by UUID NOT NULL REFERENCES users(id),
    comments TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PO Attachments table
CREATE TABLE po_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PO-related indexes
CREATE INDEX idx_purchase_orders_project_id ON purchase_orders(project_id);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_created_by ON purchase_orders(created_by);
CREATE INDEX idx_purchase_orders_pr_id ON purchase_orders(pr_id);
CREATE INDEX idx_po_line_items_po_id ON po_line_items(po_id);
CREATE INDEX idx_po_line_items_pr_line_item_id ON po_line_items(pr_line_item_id);
CREATE INDEX idx_po_status_history_po_id ON po_status_history(po_id);
CREATE INDEX idx_po_status_history_changed_by ON po_status_history(changed_by);
CREATE INDEX idx_po_attachments_po_id ON po_attachments(po_id);
CREATE INDEX idx_po_attachments_uploaded_by ON po_attachments(uploaded_by);

-- Suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_code VARCHAR(50) UNIQUE NOT NULL, -- Unique supplier code for identification
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    category VARCHAR(100) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    quote_count INTEGER DEFAULT 0,
    avg_response_time DECIMAL(8,2) DEFAULT 0, -- in hours
    last_quote_date DATE,
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'inactive')),
    approval_date TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    approval_notes TEXT,
    has_been_used BOOLEAN DEFAULT false, -- Track if supplier has been used in any transactions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

-- Supplier Contacts table
CREATE TABLE supplier_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    position VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier Categories table
CREATE TABLE supplier_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier Performance Metrics table
CREATE TABLE supplier_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    total_quotes INTEGER DEFAULT 0,
    successful_quotes INTEGER DEFAULT 0,
    avg_response_time_hours DECIMAL(8,2) DEFAULT 0,
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 0.0 CHECK (on_time_delivery_rate >= 0 AND on_time_delivery_rate <= 100),
    quality_rating DECIMAL(3,2) DEFAULT 0.0 CHECK (quality_rating >= 0 AND quality_rating <= 5),
    communication_rating DECIMAL(3,2) DEFAULT 0.0 CHECK (communication_rating >= 0 AND communication_rating <= 5),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Documents table (enhanced)
CREATE TABLE compliance_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    is_valid BOOLEAN DEFAULT true,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier-related indexes
CREATE INDEX idx_suppliers_supplier_code ON suppliers(supplier_code);
CREATE INDEX idx_suppliers_category ON suppliers(category);
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX idx_suppliers_created_by ON suppliers(created_by);
CREATE INDEX idx_suppliers_has_been_used ON suppliers(has_been_used);
CREATE INDEX idx_supplier_contacts_supplier_id ON supplier_contacts(supplier_id);
CREATE INDEX idx_supplier_contacts_is_primary ON supplier_contacts(is_primary);
CREATE INDEX idx_supplier_performance_metrics_supplier_id ON supplier_performance_metrics(supplier_id);
CREATE INDEX idx_compliance_documents_supplier_id ON compliance_documents(supplier_id);
CREATE INDEX idx_compliance_documents_expiry_date ON compliance_documents(expiry_date);
CREATE INDEX idx_compliance_documents_is_valid ON compliance_documents(is_valid);

-- Function to generate PO number
CREATE OR REPLACE FUNCTION generate_po_number(project_prefix VARCHAR(10))
RETURNS VARCHAR(50) AS $$
DECLARE
    next_number INTEGER;
    po_number VARCHAR(50);
BEGIN
    -- Get the next sequence number for this project
    SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM LENGTH(project_prefix) + 2) AS INTEGER)), 0) + 1
    INTO next_number
    FROM purchase_orders
    WHERE po_number LIKE project_prefix || '-%';
    
    -- Format as PROJECT-001, PROJECT-002, etc.
    po_number := project_prefix || '-' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN po_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate PO number on insert
CREATE OR REPLACE FUNCTION set_po_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
        -- Get project prefix (you might want to store this in projects table)
        NEW.po_number := generate_po_number('PO');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_po_number
    BEFORE INSERT ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION set_po_number();

-- Item Master Database Tables
CREATE TABLE item_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    uom VARCHAR(20) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    specifications JSONB,
    is_active BOOLEAN DEFAULT true,
    approval_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    approval_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE TABLE item_supplier_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES item_master(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    unit_price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'AED',
    valid_from DATE NOT NULL,
    valid_to DATE,
    lead_time_days INTEGER,
    minimum_order_qty INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE supplier_item_capability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES item_master(id) ON DELETE CASCADE,
    is_primary_supplier BOOLEAN DEFAULT false,
    capability_rating DECIMAL(3,2) CHECK (capability_rating >= 0 AND capability_rating <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(supplier_id, item_id)
);

-- Indexes for Item Master tables
CREATE INDEX idx_item_master_item_code ON item_master(item_code);
CREATE INDEX idx_item_master_category ON item_master(category);
CREATE INDEX idx_item_master_approval_status ON item_master(approval_status);
CREATE INDEX idx_item_master_is_active ON item_master(is_active);
CREATE INDEX idx_item_master_created_by ON item_master(created_by);

CREATE INDEX idx_item_supplier_pricing_item_id ON item_supplier_pricing(item_id);
CREATE INDEX idx_item_supplier_pricing_supplier_id ON item_supplier_pricing(supplier_id);
CREATE INDEX idx_item_supplier_pricing_valid_from ON item_supplier_pricing(valid_from);
CREATE INDEX idx_item_supplier_pricing_valid_to ON item_supplier_pricing(valid_to);

CREATE INDEX idx_supplier_item_capability_supplier_id ON supplier_item_capability(supplier_id);
CREATE INDEX idx_supplier_item_capability_item_id ON supplier_item_capability(item_id);
CREATE INDEX idx_supplier_item_capability_is_primary ON supplier_item_capability(is_primary_supplier);

-- Enable RLS for Item Master tables
ALTER TABLE item_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_supplier_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_item_capability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Item Master
CREATE POLICY "Users can view items in their projects" ON item_master
    FOR SELECT USING (
        created_by IN (
            SELECT user_id FROM user_project_memberships WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create items for their projects" ON item_master
    FOR INSERT WITH CHECK (
        created_by = auth.uid()
    );

CREATE POLICY "Users can update items they created" ON item_master
    FOR UPDATE USING (
        created_by = auth.uid()
    );

-- RLS Policies for Item-Supplier Pricing
CREATE POLICY "Users can view pricing for items in their projects" ON item_supplier_pricing
    FOR SELECT USING (
        item_id IN (
            SELECT id FROM item_master 
            WHERE created_by IN (
                SELECT user_id FROM user_project_memberships WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create pricing for items in their projects" ON item_supplier_pricing
    FOR INSERT WITH CHECK (
        item_id IN (
            SELECT id FROM item_master 
            WHERE created_by IN (
                SELECT user_id FROM user_project_memberships WHERE user_id = auth.uid()
            )
        )
    );

-- RLS Policies for Supplier Item Capability
CREATE POLICY "Users can view capabilities for items in their projects" ON supplier_item_capability
    FOR SELECT USING (
        item_id IN (
            SELECT id FROM item_master 
            WHERE created_by IN (
                SELECT user_id FROM user_project_memberships WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create capabilities for items in their projects" ON supplier_item_capability
    FOR INSERT WITH CHECK (
        item_id IN (
            SELECT id FROM item_master 
            WHERE created_by IN (
                SELECT user_id FROM user_project_memberships WHERE user_id = auth.uid()
            )
        )
    );
