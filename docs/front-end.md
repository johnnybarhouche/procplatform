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
	•	Left: Company logo uploaded during project initiation alongside the active project name (replaces the “Global Operations” placeholder).
	•	Right cluster ordered left→right as: role indicator (bold, non-interactive), notifications bell, and user initials avatar that opens the profile menu (update name, email, phone number, address, designation). All controls live on a single baseline with the project title.
	•	Background: Deep Blue #002664, text/icons White.
	•	Pinned to top (position: sticky/fixed) so global controls remain visible; apply subtle shadow when content scrolls beneath and keep the bar height constant so the nav offset never drifts.
	•	Spacing to canvas mirrors horizontal gutters: 8px ≤1280px, 12px at 1281–1440px, 16px ≥1441px so headings align with sidebar labels across every page; enforce perfect vertical alignment across logo, title, and right-side controls.
	•	Left Navigation (desktop):
	•	Background: White.
	•	Active item: Blue highlight bar, bold text.
	•	Items: Dashboard, MRs, RFQs, PRs, POs, Suppliers, Items, Analytics, Admin.
	•	Column width trimmed to 176px with balanced 8px horizontal padding so icons + labels stay visually centered; sticky offset mirrors the top bar gap and eliminates drift.
	•	Typography: 18px (Tailwind `text-lg`) labels paired with `text-xl` icons and 8px horizontal padding for a balanced stack; buttons fill the column width for consistent alignment.
	•	Nav supports its own internal scroll if menu height exceeds viewport while remaining visually pinned relative to page headings.
	•	Mobile Navigation:
	•	Collapsible sidebar → Bottom tab bar for core modules.
	•	Content Canvas (responsive):
	•	Desktop sidebar stays fixed at 188px; below 1024px it converts to an overlay drawer.
	•	Canvas is fluid—no wide-mode toggle—with side gutters set to 8px ≤1280px, 12px at 1281–1440px, and 16px ≥1441px; headings align horizontally with sidebar labels using matching top margins.
	•	Maintain at least 16px breathing room on phones; larger viewports follow the gutter values above.
	•	Tables and analytics stretch with the viewport while individual form clusters cap at 640px for readability; primary page titles share the same baseline as the first sidebar item.

⸻

3. Core User Flows

3.0 Authentication & Landing
	•	Sign-in page collects Username, Password, and a Request Access CTA alongside a Remember Me toggle; styling follows enterprise tokens.
	•	First-time sign-ins trigger a one-time passcode emailed to the user; the session remains inactive until the OTP is validated. OTP input supports six-character entry, countdown timer, resend, and inline error messaging for expired codes.
	•	Successful authentication routes users into the project mapped to their username; multi-project users choose from authorised projects after login, with a searchable modal listing recent projects.
	•	Request Access workflow captures name, email, phone, company, desired project, and justification; confirmation toast plus email notification route requests to admins for approval.
	•	Remember Me toggle drives cookie duration (30 days) and surfaces a “public device?” helper label to discourage use on shared machines.
	•	Admin landing workspace provides a project initiation wizard to capture project name, upload the company logo, define default currency, and assign initial roles; admins can revisit to adjust roles later and preview branding on the top bar.

3.1 Material Request (MR)
	•	Form:
	•	Project auto-selected or dropdown if multiple.
	•	Line items in editable table (Admin-configurable fields).
	•	Attachments: photos/files at MR or line level.
	•	States: Draft (grey), Submitted (blue).
	•	CTA Buttons: Blue background, white text.
	•	Primary action group (Import from Excel, Add Line Item, Submit MR) aligns with the page title baseline on the top-right of the canvas.

⸻

3.2 Procurement (RFQ)
	•	Inbox: Table lists requester, project, created date, and positions status as the final column; status chips use light red for New Request and light green for RFQ Sent. Remove amount and compare-quotes columns.
	•	Sending an RFQ flips the status chip from New Request to RFQ Sent automatically.
	•	View Details button on each row opens the originating MR; supplier suggestion sidebar is removed.
	•	Wizard Flow:
	1.	Select MR lines for inclusion.
	2.	Review suggested suppliers surfaced inline under each selected line item with contact details pulled from historical purchases.
	3.	Add new suppliers when suggestions are absent or incomplete.
	4.	Send requests to individual suppliers or Select All at the line level before dispatching.
	5.	Set due date/terms and dispatch RFQ notifications.
	•	Inline supplier cards show company, contact, category tags, last purchase date/price, and badges when suggestion confidence is low or missing data.
	•	Quote Comparison Grid:
	•	Rows = Items, Columns = Suppliers.
	•	Highlight lowest price per line in green.

⸻

3.3 Quote Approval (End User)
	•	Read-only comparison grid stays central but expands horizontally for improved readability; remove the secondary right-side “Select Supplier” panel.
	•	Approvers choose suppliers directly within each line of the grid using radio buttons in the supplier columns (split awards supported).
	•	Confirmation modal before submission.
	•	Mandatory step; end user must select supplier(s) per line before PR creation.
	•	Sticky summary bar at the bottom lists selected suppliers, savings deltas, and highlights lines awaiting decisions; modal reiterates these details.

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
	•	Project Initiation Wizard: Steps for Basics (project name, description, currency), Branding (logo upload with preview, accent color select), and Roles (assign users to Administrator, Procurement, Approver defaults); completion preview shows how the header will render.
	•	Admins can relaunch the wizard from the landing page to update branding and role mappings post-launch.
	•	PO Templates (new):
	•	List with versions.
	•	Wizard for Upload → Placeholders → Preview → Assign → Publish.
	•	Preview pane = White PDF viewer frame, Blue border.

⸻

4. Cross-Cutting UX Elements
	•	Traceability Chips: Blue pill components linking MR ↔ PR ↔ PO.
	•	Notifications: Bell with red badge for pending items.
	•	Profile Menu: Avatar circle opens panel for updating name, email, phone, address, and designation; include shortcuts to “Manage Notification Preferences” and “Sign out”.
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
