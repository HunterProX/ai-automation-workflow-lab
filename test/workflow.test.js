const test = require('node:test');
const assert = require('node:assert/strict');
const { STATES, createProposal, approve, reject, execute } = require('../workflow');

test('workflow requires approval before execution', () => {
  const workflow = createProposal({ idempotency_key: 'case-0001', action: 'create_review_task', subject: 'Review synthetic alert' });
  assert.equal(workflow.state, STATES.PENDING_APPROVAL);
  assert.throws(() => execute(workflow), /execution_not_allowed/);
  approve(workflow, 'reviewer');
  const result = execute(workflow);
  assert.equal(result.replay, false);
  assert.equal(workflow.state, STATES.EXECUTED);
});

test('duplicate execution is idempotent', () => {
  const workflow = approve(createProposal({ idempotency_key: 'case-0002', action: 'request_human_followup', subject: 'Follow up on review' }), 'reviewer');
  const first = execute(workflow);
  const second = execute(workflow);
  assert.equal(first.replay, false);
  assert.equal(second.replay, true);
  assert.equal(workflow.audit.filter((item) => item.type === 'executed').length, 1);
});

test('rejection is terminal and audited', () => {
  const workflow = createProposal({ idempotency_key: 'case-0003', action: 'create_review_task', subject: 'Review synthetic input' });
  reject(workflow, 'reviewer', 'Insufficient context');
  assert.equal(workflow.state, STATES.REJECTED);
  assert.throws(() => execute(workflow), /execution_not_allowed/);
  assert.equal(workflow.audit.at(-1).type, 'rejected');
});

test('invalid actions fail closed', () => {
  assert.throws(() => createProposal({ idempotency_key: 'case-0004', action: 'delete_everything', subject: 'Never execute' }), /unsupported_action/);
});
