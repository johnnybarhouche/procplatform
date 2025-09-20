# Data Model Highlights

	•	Material Requests: mrs → mr_lines.
	•	RFQs: rfqs → rfq_suppliers → quotes → quote_lines.
	•	Requisitions: prs → pr_lines.
	•	Orders: pos → po_lines.
	•	Suppliers: suppliers + supplier_history.
	•	Items: items + item_prices.
	•	Approvals: generic table covering MR, PR, PO, Quote Packs.
	•	Audit logs: actor, action, before/after JSON diffs.
