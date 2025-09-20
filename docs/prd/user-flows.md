# User Flows

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
	•	Submit "Quote Pack" to end user for mandatory approval.

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
