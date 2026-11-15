export function normalizeAccountEmail(email?: string | null): string | null {
  const normalized = email?.trim().toLowerCase()
  return normalized ? normalized : null
}

export function normalizeProviderAccountId(providerAccountId?: string | null): string | null {
  const normalized = providerAccountId?.trim()
  return normalized ? normalized : null
}
