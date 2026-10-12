import { describe, it, expect } from 'vitest'
import { computePageAfterBulkDelete } from './computePageAfterBulkDelete'

describe('computePageAfterBulkDelete', () => {
  // Given the current page still has rows left after the deletion
  // When computing the page to show
  // Then it should stay on the current page
  it('stays on the current page when it still has rows', () => {
    expect(computePageAfterBulkDelete(2, 25, 2, 10)).toBe(2)
  })

  // Given the deletion empties the last page the user was on
  // When computing the page to show
  // Then it should move back to the new last page
  it('moves back to the new last page when the current one becomes empty', () => {
    expect(computePageAfterBulkDelete(3, 21, 1, 10)).toBe(2)
  })

  // Given every row is deleted
  // When computing the page to show
  // Then it should never go below page 1
  it('never returns a page below 1', () => {
    expect(computePageAfterBulkDelete(1, 3, 3, 10)).toBe(1)
  })
})
