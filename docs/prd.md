
📝 Product Requirements Document (PRD) — Procurement Application

1. Overview

A procurement application designed for small and large companies to digitize and streamline procurement activities. The system covers the full cycle from Material Request (MR) to Purchase Order (PO), enabling transparency, efficiency, and scalability.

⸻

2. Goals & Objectives
	•	Digitize procurement workflows to reduce cycle time.
	•	Support SMBs with preconfigured simple workflows.
	•	Scale for enterprises with customizable approvals and multi-project management.
	•	Ensure compliance with robust audit trails and approvals.
	•	Differentiate through advanced analytics, mobile-first design, and AI readiness.

⸻

3. Scope

In Scope (MVP)
	•	MR → RFQ → Quote Approval → PR → PO workflows.
	•	Supplier management & item master.
	•	Admin-configurable MR fields.
	•	Role-based access control (RBAC) & project authorization matrices.
	•	Audit logs, notifications, and attachments.
	•	Analytics dashboards (basic KPIs).
	•	Currency: AED (with admin-configurable USD conversion).
	•	Integrations: SSO, e-signature.
    •   Quote Approval is a required step. PRs and POs follow multi-step approvals as defined by project-specific authorization matrices

Out of Scope (MVP, Phase 2/Future)
	•	AI-powered supplier recommendations.
	•	Automated document parsing (RFQ/quote ingestion).
	•	Advanced analytics (savings dashboards, SLA tracking).

⸻

4. Target Users & Personas
	•	End User / Requester – submits MRs and approves supplier quotes.
	•	Procurement Officer – manages RFQs, suppliers, PRs, and POs.
	•	Approver (Manager/Finance) – approves PRs and POs according to policy.
	•	Supplier – receives RFQs/POs, submits quotations.
	•	Admin – manages roles, approval policies, field configurations, and integrations.

⸻

5. User Flows

5.1 Material Request (MR)
	•	Project pre-selected (auto if 1 project, dropdown if multiple).
	•	Line items include: MRN, ItemCode, Description, UoM, Qty, Remarks, Location, Brand/Asset, Serial/Chassis/Engine No., Model Year.
	•	Configurable via Admin.
	•	Attach photos/files.
	•	Supplier suggestions not visible to end user.

5.2 Procurement (RFQ)
	•	Procurement inbox for submitted MRs.
	•	Supplier Suggestions Panel (procurement-only): shows historical suppliers and prices.
	•	RFQ creation: group lines, select suppliers, send tracked emails/portal links.
	•	Capture quotes: manual entry/upload.
	•	Comparison grid for quotes.
	•	Submit “Quote Pack” to end user for mandatory approval.

5.3 Quote Approval (End User)
	•	End user reviews comparison grid.
	•	Must approve supplier(s) per line (split awards supported).
	•	Locked lines proceed to PR creation.

5.4 Purchase Requisition (PR)
	•	Generated per supplier.
	•	Routed via project-specific authorization matrix.
	•	Approvers approve/reject/comment.
	•	Audit log maintained.

5.5 Purchase Order (PO)
	•	Generated from approved PRs.
	•	Auto-numbered per project rules.
	•	Approval step if above threshold.
	•	PDF/CSV dispatch to suppliers.
	•	Timeline: Draft → Approved → Sent → Acknowledged.

5.6 Supplier Management
	•	Supplier profiles (contacts, docs, categories, ratings).
	•	Compliance document tracking with expiry reminders.
	•	Historical pricing per item.

5.7 Item Database
	•	Central catalog of items with historical prices.
	•	Linked to supplier records.

5.8 Analytics
	•	KPIs: PRs per month, PO value per month, RFQ response rates, supplier share of spend, item price trends.
	•	Export to CSV.

5.9 Admin
	•	Configure MR fields (visible/required/order).
	•	Authorization matrix per project.
	•	Currency (AED base, USD conversion rate).
	•	Role & project assignment.
	•	Manage integrations (SSO, e-signature).

⸻

6. Non-Functional Requirements (NFRs)
	•	Performance: Handle up to 1,000 MRs/month, 10,000 line items.
	•	Security: RBAC, SSO, MFA support, encrypted storage of docs.
	•	Auditability: Every action logged with timestamp, actor, before/after values.
	•	Usability: Mobile-friendly approvals.
	•	Scalability: Support multi-project/multi-tenant use.

⸻

7. Opportunities for Differentiation
	•	AI-powered supplier recommendation – future enhancement to suggest optimal vendors.
	•	Cost analytics & savings dashboards – highlight realized savings, supplier performance.
	•	Mobile-first approvals – approvals in <3 taps, optimized for speed.
	•	Template-based workflows – SMBs can use preconfigured flows; enterprises can customize.

⸻

8. Success Metrics
	•	Reduce MR → PO cycle time by 30% within 6 months.
	•	≥ 90% of approvals completed within SLA (e.g., 3 days).
	•	≥ 70% adoption rate across target user base by month 6.
	•	Supplier database ≥ 80% populated with complete data by month 3.

⸻

9. Risks & Mitigations
	•	User adoption – mitigate with training & mobile-first design.
	•	Approval bottlenecks – mitigate with notifications & escalation.
	•	Supplier engagement – mitigate by allowing email-based participation initially.

⸻

10. Roadmap

MVP (first 6 months)
	•	MR → RFQ → Quote Approval → PR → PO
	•	Supplier + Item management
	•	Advanced analytics dashboards
	•	Admin controls
	•	SSO + e-signature

Phase 2 (6–12 months)
	•	ERP integrations (SAP, Oracle, etc.).
	•	AI supplier recommendations
	•	Automated quote parsing
	•	ERP integrations
