const STATES = Object.freeze({ PROPOSED: 'proposed', PENDING_APPROVAL: 'pending_approval', APPROVED: 'approved', REJECTED: 'rejected', EXECUTED: 'executed' });
const ACTIONS = new Set(['create_review_task', 'request_human_followup']);

function event(workflow, type, details = {}) {
  workflow.audit.push({ sequence: workflow.audit.length + 1, type, details });
}

function createProposal(input) {
  if (!input || typeof input !== 'object') throw new Error('invalid_input');
  if (typeof input.idempotency_key !== 'string' || input.idempotency_key.length < 8) throw new Error('invalid_idempotency_key');
  if (!ACTIONS.has(input.action)) throw new Error('unsupported_action');
  if (typeof input.subject !== 'string' || input.subject.trim().length === 0) throw new Error('invalid_subject');
  const workflow = { id: `wf-${input.idempotency_key}`, state: STATES.PROPOSED, action: input.action, subject: input.subject.trim(), audit: [] };
  event(workflow, 'created', { action: workflow.action });
  workflow.state = STATES.PENDING_APPROVAL;
  event(workflow, 'approval_requested');
  return workflow;
}

function approve(workflow, approver) {
  if (workflow.state !== STATES.PENDING_APPROVAL) throw new Error('approval_not_allowed');
  if (typeof approver !== 'string' || approver.trim().length === 0) throw new Error('invalid_approver');
  workflow.state = STATES.APPROVED;
  event(workflow, 'approved', { approver: approver.trim() });
  return workflow;
}

function reject(workflow, approver, reason) {
  if (workflow.state !== STATES.PENDING_APPROVAL) throw new Error('rejection_not_allowed');
  if (typeof approver !== 'string' || typeof reason !== 'string' || reason.trim().length === 0) throw new Error('invalid_rejection');
  workflow.state = STATES.REJECTED;
  event(workflow, 'rejected', { approver: approver.trim(), reason: reason.trim() });
  return workflow;
}

function execute(workflow) {
  if (workflow.state === STATES.EXECUTED) return { workflow, replay: true, result: { idempotency_key: workflow.id } };
  if (workflow.state !== STATES.APPROVED) throw new Error('execution_not_allowed');
  workflow.state = STATES.EXECUTED;
  const result = { idempotency_key: workflow.id, action: workflow.action, subject: workflow.subject };
  event(workflow, 'executed', result);
  return { workflow, replay: false, result };
}

module.exports = { STATES, createProposal, approve, reject, execute };
