📑 UI/UX Design Brief — Procurement Application

1. Brand Guidelines
	•	Primary Colors (DSV Corporate):
	•	Deep Blue #002664 → use for headers, primary CTAs, and nav background.
	•	White #FFFFFF → main content background.
	•	Black #000000 → primary text and key accents.
	•	Secondary Palette: Use sparingly (status chips, alerts, highlights).
	•	Green (#00682A) → Approved / Success states.
	•	Orange/Amber (#C64801, #FFC40C) → Pending, warnings.
	•	Red (#E18375) → Rejected, errors.
	•	Typography: Sans-serif (corporate-approved; fallback: Arial/Roboto).
	•	Tone: Clean, minimal, enterprise-grade.

⸻

2. Global Layout
	•	Top Bar (persistent):
	•	Left: Customer logo + Application/Project name (brand-specific).
	•	Center: Project selector (if multiple).
	•	Right: Admin dropdown, Notifications bell, Profile menu.
	•	Background: Deep Blue #002664, text/icons White.
	•	Left Navigation (desktop):
	•	Background: White.
	•	Active item: Blue highlight bar, bold text.
	•	Items: Dashboard, MRs, RFQs, PRs, POs, Suppliers, Items, Analytics, Admin.
	•	Mobile Navigation:
	•	Collapsible sidebar → Bottom tab bar for core modules.

⸻

3. Core User Flows

3.1 Material Request (MR)
	•	Form:
	•	Project auto-selected or dropdown if multiple.
	•	Line items in editable table (Admin-configurable fields).
	•	Attachments: photos/files at MR or line level.
	•	States: Draft (grey), Submitted (blue).
	•	CTA Buttons: Blue background, white text.

⸻

3.2 Procurement (RFQ)
	•	Inbox: Table with MRs (status, requester, project).
	•	Wizard Flow:
	1.	Select MR lines.
	2.	Supplier Suggestions (procurement only, right-side panel).
	3.	Add suppliers manually.
	4.	Set due date/terms.
	5.	Dispatch RFQ.
	•	Quote Comparison Grid:
	•	Rows = Items, Columns = Suppliers.
	•	Highlight lowest price per line in green.

⸻

3.3 Quote Approval (End User)
	•	Read-only Comparison Grid.
	•	Selection via radio buttons per line.
	•	Confirmation modal before submission.
	•	Mandatory step; split awards supported. End user must select supplier(s) per line before PR creation

⸻

3.4 Purchase Requisition (PR)
	•	Detail View:
	•	Header: Project, Supplier, PR Number.
	•	Table of items, values in AED & USD.
	•	Approval buttons (Approve/Reject/Comment).
	•	Approval Matrix: show pending approvers.
	•	Audit Trail Tab: chronological log.

⸻

3.5 Purchase Order (PO)
	•	Detail View:
	•	Header with PO Number, Project, Supplier.
	•	Line items table.
	•	Status timeline: Draft → Approved → Sent → Acknowledged.
	•	Actions: Generate PDF, Send to Supplier.
	•	Supplier-facing PDF:
	•	White background, Deep Blue header, logo top-left.
	•	Item tables with alternating light-grey rows.
	•	Multi-step approval flows must be supported depending on amount thresholds.

⸻

3.6 Supplier Management
	•	Directory Table: Supplier name, status, spend.
	•	Profile Tabs: Contacts, Docs, Price history, Past POs.
	•	Compliance Alerts: Red badge for expired docs.

⸻

3.7 Item Database
	•	Catalog Table: SKU, UoM, Description.
	•	Detail: Price trend chart (blue line), top suppliers list.

⸻

3.8 Analytics Dashboard
	•	KPIs (Metric Cards):
	•	PRs/month, PO value/month, Supplier share of spend, Item price trends.
	•	Card layout with Deep Blue icons.
	•	Charts: Recharts (bar, pie, line).
	•	Export buttons: White with Blue outline.

⸻

3.9 Admin
	•	MR Field Configurator: Drag/drop list, toggles for required/visible.
	•	Authorization Matrix: Table (Role vs Threshold).
	•	Currency Settings: AED↔USD rate entry.
	•	PO Templates (new):
	•	List with versions.
	•	Wizard for Upload → Placeholders → Preview → Assign → Publish.
	•	Preview pane = White PDF viewer frame, Blue border.

⸻

4. Cross-Cutting UX Elements
	•	Traceability Chips: Blue pill components linking MR ↔ PR ↔ PO.
	•	Notifications: Bell with red badge for pending items.
	•	Forms: White background, Blue headers, Black labels, Grey field borders.
	•	Error States: Red text + inline icon.
	•	Mobile Approvals: Swipe cards → left (Reject, Red), right (Approve, Green).

⸻

5. Accessibility
	•	Contrast ratios follow WCAG AA (DSV Blue on White is compliant).
	•	Text sizes: 16px min for body, 20–24px for headers.
	•	Icons always paired with text labels.

⸻

6. Deliverables for Design Team
	1.	Wireframes (low-fi):
	•	MR form, RFQ Wizard, Quote Approval, PR Approver Card, PO timeline.
	2.	Mockups (high-fi):
	•	Dashboard, Analytics, PO PDF template.
	3.	Design Tokens:
	•	Colors: DSV primary & secondary.
	•	Typography: font family, sizes, weights.
	•	Spacing system (8px grid).
	•	Components: Buttons, Inputs, Tables, Tabs, Cards, Modals.
	4.	Prototype (optional): Interactive Figma flows for MR → PO.