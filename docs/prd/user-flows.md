# User Flows


5.0 Authentication & Landing
	•	Sign-in page presents Username, Password, Remember Me toggle (with shared-device warning), and Request Access CTA.
	•	First-time sign-ins require an emailed one-time passcode prior to granting workspace access; OTP entry shows countdown, resend, and rate-limited error states.
	•	Post-login routing lands users in the project tied to their username; multi-project access prompts a searchable selection modal with recent projects.
	•	Request Access flow captures contact details, company, desired project, and justification, notifying admins and surfacing confirmation to the requester.
	•	Admin landing workspace includes a project initiation wizard for project name, description, company logo upload/preview, default currency, and initial role assignments (editable later with branding preview).

5.1 Material Request (MR)
	•	Project pre-selected (auto if 1 project, dropdown if multiple).
	•	Line items include: MRN, ItemCode, Description, UoM, Qty, Remarks, Location, Brand/Asset, Serial/Chassis/Engine No., Model Year.
	•	Configurable via Admin.
	•	Attach photos/files.
	•	Supplier suggestions not visible to end user.
	•	Primary action buttons (Import from Excel, Add Line Item, Submit MR) align with the page title baseline on desktop.

5.2 Procurement (RFQ)
	•	Procurement inbox lists submitted MRs with requester, project, created date, and a right-aligned status column using chips: New Request (light red) and RFQ Sent (light green); amount and compare-quotes columns are removed.
	•	Send RFQ action flips status from New Request to RFQ Sent automatically; View Details opens the originating MR.
	•	Supplier suggestions no longer occupy a persistent right-side panel; they surface inline under each selected line item within the wizard with contact, category, and last purchase data.
	•	RFQ creation: group lines, review suggested suppliers per line (with contacts and history indicators), add new suppliers when needed, optionally send requests per supplier or select-all at the line level, and dispatch tracked emails/portal links.
	•	Capture quotes: manual entry/upload.
	•	Comparison grid for quotes.
	•	Submit “Quote Pack” to end user for mandatory approval.

5.3 Quote Approval (End User)
	•	End user reviews an expanded comparison grid without the secondary “Select Supplier” panel.
	•	Supplier selections happen directly within each line of the grid (radio buttons per supplier column, split awards supported).
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
