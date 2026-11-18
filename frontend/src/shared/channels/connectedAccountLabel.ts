export function normalizedAccountEmail(accountEmail?: string | null) {
  if (typeof accountEmail !== 'string') return null
  const email = accountEmail.trim().toLowerCase()
  return email || null
}

export function connectedAccountLabel(accountEmail?: string | null) {
  const email = normalizedAccountEmail(accountEmail)
  return email ? `Conectado como ${email}` : null
}
