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

-- Indexes for performance
CREATE INDEX idx_material_requests_project_id ON material_requests(project_id);
CREATE INDEX idx_material_requests_created_by ON material_requests(created_by);
CREATE INDEX idx_material_requests_status ON material_requests(status);
CREATE INDEX idx_mr_line_items_mr_id ON mr_line_items(mr_id);
CREATE INDEX idx_attachments_mr_id ON attachments(mr_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

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
