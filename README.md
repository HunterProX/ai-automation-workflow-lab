# AI Automation Workflow Lab

Bounded workflow automation reproduction with explicit human approval,
deterministic actions, idempotency, retries, and an audit trail.

## Classification

This is a new public reproduction. It is not a production automation service,
client workflow, Personal OS integration, or autonomous agent platform.

## Quickstart

Requirements: Node.js 20+.

```bash
npm test
npm run doctor
```

## Workflow

```text
synthetic input
  -> proposed action
  -> approval request
  -> human approval or rejection
  -> deterministic action
  -> audit event
```

Only these synthetic actions are allowed:

- `create_review_task`
- `request_human_followup`

No external services are called. Every mutation requires approval, and repeated
execution with the same workflow is idempotent.

## Boundaries

- No Personal OS writes.
- No Gmail, Slack, LinkedIn, or financial integrations.
- No n8n or OpenClaw.
- No autonomous production actions.
- No client or private data.

The purpose is to demonstrate workflow state, approval boundaries, failure
handling, and auditability before considering real integrations.
