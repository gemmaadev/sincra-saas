export function computePageAfterBulkDelete(
  currentPage: number,
  totalBeforeDelete: number,
  deletedCount: number,
  pageSize: number,
): number {
  const remaining = totalBeforeDelete - deletedCount
  const lastPage = Math.max(1, Math.ceil(remaining / pageSize))
  return Math.min(currentPage, lastPage)
}
