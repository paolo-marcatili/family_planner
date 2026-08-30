import { describe, expect, it } from 'vitest'
import { decodeProposalEvent, proposalToPlannerItem } from './proposalInbox'

const proposal = { external_id: 'test-1', type: 'task', status: 'proposed', source: 'manual', title: 'Synthetic task', suggested_assignee: 'organizer_1' }
const description = `--- FAMILY PLANNER PROPOSAL ---\n${JSON.stringify({ marker: 'X-FAMILY-PLANNER-PROPOSAL', version: '1.0', request_id: 'request-001', external_id: 'test-1', proposal })}\n--- END FAMILY PLANNER PROPOSAL ---`

describe('proposal inbox', () => {
  it('decodes a marked proposal and maps it for review', () => {
    expect(decodeProposalEvent(description)?.external_id).toBe('test-1')
    expect(proposalToPlannerItem({ id: 'google-1', description }, 0)?.status).toBe('proposed')
  })
  it('ignores unmarked events', () => expect(decodeProposalEvent('ordinary event')).toBeNull())
})
