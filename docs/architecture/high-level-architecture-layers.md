# High-Level Architecture Layers

1.1 Frontend (UI Layer)
	•	Tech: React + TailwindCSS + Headless UI (clean, lightweight, avoids CSS conflicts).
	•	Design system: based on DSV corporate palette (Deep Blue, White, Black).
	•	Architecture: Single-Page Application (SPA), responsive design, PWA-enabled for mobile approvals.
	•	Features:
	•	Role-based dashboards (Requester, Procurement, Approver, Admin).
	•	Modules: MR form, RFQ management, Quote approval, PR/PO workflows, Supplier & Item management, Analytics.
	•	Multi-project support; i18n framework in place for multi-language.

1.2 Backend (API Layer)
	•	Tech: Node.js with NestJS (preferred over raw Express for modularity, dependency injection, Swagger API docs).
	•	Architecture: RESTful APIs (option for GraphQL layer in Phase-2).
	•	Responsibilities:
	•	Business logic for MR → RFQ → Quote → PR → PO transitions.
	•	Approval routing, status management via centralized state machine.
	•	Role-based authorization (RBAC + ABAC).
	•	Audit logging.
	•	Integration endpoints (SSO, e-signature, email service, ERP connectors).

1.3 Database (Persistence Layer)
	•	Tech: PostgreSQL (Supabase for MVP, Aurora Postgres for enterprise scale).
	•	Schema highlights:
	•	Core tables: projects, users, roles, suppliers, items, MRs, RFQs, quotes, PRs, POs, approvals, audit_logs, attachments.
	•	Normalized structure with referential integrity (FK constraints).
	•	Indexed on MRN/PO numbers, supplier names, project IDs.
	•	Security: Row-Level Security (RLS) enabled for project scoping.
	•	Scalability: Supports read replicas for analytics/reporting load.

1.4 File Storage
	•	Tech: Cloud object storage (AWS S3, Azure Blob, or Supabase storage).
	•	Usage: Stores photos, PDFs, RFQs, POs, compliance docs.
	•	Access: Presigned URLs (15-min expiry) for uploads/downloads.
	•	Extras: Virus scanning pipeline (ClamAV or service integration).

1.5 Authentication & Authorization
	•	Tech: SSO via SAML/OAuth2 (Azure AD, Okta).
	•	MFA support for enterprise security.
	•	RBAC: Role-based access across modules.
	•	ABAC: Attribute-based rules (e.g., user can only approve PRs in their project and below their threshold).
	•	Authorization matrix: stored per project, editable via Admin UI.

1.6 Integrations
	•	E-signature: DocuSign (primary) or Adobe Sign (alt).
	•	Email service: AWS SES or SendGrid (RFQ/PO dispatch, notifications).
	•	ERP (Phase-2): Integration layer with REST/EDI connectors (SAP, Oracle).
	•	Webhooks: Framework for supplier portal submissions and e-signature callbacks.

1.7 Analytics & Reporting
	•	Data aggregation: DB views + materialized aggregates for KPIs.
	•	APIs: expose metrics to frontend dashboards (Recharts/D3).
	•	Exports: CSV for offline analysis.
	•	Future (Phase-2): OLAP warehouse (BigQuery/Redshift) for advanced analytics.
