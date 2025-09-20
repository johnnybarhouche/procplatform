# Cross-Cutting Concerns

	•	Auditability: Immutable audit_logs table.
	•	Notifications: Event queue (RabbitMQ/SQS) for async dispatch; Dead Letter Queue for failures.
	•	Scalability: Stateless API containers (Docker/Kubernetes/ECS); auto-scaling DB replicas.
	•	Security: TLS, encryption at rest, signed URLs for file access.
	•	Config: Admin portal writes into config tables (MR fields, FX rates, thresholds).
	•	Feature flags: Safe rollout of Phase-2+ features.
