import assert from 'node:assert/strict'
import test from 'node:test'
import { conversationBelongsToAgent } from '../src/utils/conversation'

test('conversationBelongsToAgent matches the current agent id', () => {
  assert.equal(conversationBelongsToAgent({ agent_id: 'agent-123' }, 'agent-123'), true)
  assert.equal(conversationBelongsToAgent({ agent_id: 'agent-456' }, 'agent-123'), false)
  assert.equal(conversationBelongsToAgent({}, 'agent-123'), false)
})
