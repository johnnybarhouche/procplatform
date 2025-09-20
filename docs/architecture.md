🌐 Final Architecture Document — Procurement Application

1. High-Level Architecture Layers

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

⸻

2. Workflow Handling
	•	Workflow engine: Lightweight service inside backend.
	•	Workflow engine enforces mandatory Quote Approval step. PRs and POs route through multi-step approval matrices based on thresholds.
	•	Transitions: MR → RFQ → PR → PO orchestrated centrally.
	•	State machine: All status enums managed in one config (draft, submitted, approved, rejected).
	•	Approval matrix: Driven by project policies, thresholds, and roles.

⸻

3. Data Model Highlights
	•	Material Requests: mrs → mr_lines.
	•	RFQs: rfqs → rfq_suppliers → quotes → quote_lines.
	•	Requisitions: prs → pr_lines.
	•	Orders: pos → po_lines.
	•	Suppliers: suppliers + supplier_history.
	•	Items: items + item_prices.
	•	Approvals: generic table covering MR, PR, PO, Quote Packs.
	•	Audit logs: actor, action, before/after JSON diffs.

⸻

4. Cross-Cutting Concerns
	•	Auditability: Immutable audit_logs table.
	•	Notifications: Event queue (RabbitMQ/SQS) for async dispatch; Dead Letter Queue for failures.
	•	Scalability: Stateless API containers (Docker/Kubernetes/ECS); auto-scaling DB replicas.
	•	Security: TLS, encryption at rest, signed URLs for file access.
	•	Config: Admin portal writes into config tables (MR fields, FX rates, thresholds).
	•	Feature flags: Safe rollout of Phase-2+ features.

⸻

5. Deployment & DevOps
	•	CI/CD: GitHub Actions → build/test/deploy.
	•	Quality gates: Static code analysis, security scans (ESLint, SonarQube, Dependabot).
	•	Infra as Code: Terraform/CloudFormation for reproducible environments.
	•	Environments: Dev → Staging → Prod.
	•	Hosting:
	•	Backend: Docker containers in Kubernetes/ECS.
	•	Frontend: Vercel/Netlify for MVP; enterprise on private hosting/VPN.
	•	Database: Managed Postgres (Supabase for MVP; Aurora in enterprise).

⸻

6. MVP vs Phase-2 Tech Considerations

MVP (first release)
	•	React frontend (PWA-enabled).
	•	Node.js/NestJS backend.
	•	Supabase Postgres with RLS.
	•	SSO integration + e-signature (DocuSign).
	•	Email dispatch via SES/SendGrid.
	•	Manual quote entry + CSV upload.
	•	Mobile-first approvals (swipe/approve).
	•	Advanced analytics (OLAP warehouse, custom dashboards).


Phase-2 (scale & differentiation)
	•	AI supplier recommendation (ML service trained on supplier_history).
	•	ERP integrations (SAP/Oracle connectors).
	•	Automated document parsing (OCR/AI microservice).
	•	Multi-language UI rollout.
	•	Embedded e-signature blocks inside PO PDFs.