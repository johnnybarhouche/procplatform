# Workflow Handling

	•	Workflow engine: Lightweight service inside backend.
	•	Workflow engine enforces mandatory Quote Approval step. PRs and POs route through multi-step approval matrices based on thresholds.
	•	Transitions: MR → RFQ → PR → PO orchestrated centrally.
	•	State machine: All status enums managed in one config (draft, submitted, approved, rejected).
	•	Approval matrix: Driven by project policies, thresholds, and roles.
