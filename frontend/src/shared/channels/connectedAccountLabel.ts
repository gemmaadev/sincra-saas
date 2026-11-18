export function connectedAccountLabel(accountEmail?: string | null) {
  if (typeof accountEmail !== 'string') return 'Cuenta conectada'
  const email = accountEmail.trim().toLowerCase()
  return email ? `Conectado como ${email}` : 'Cuenta conectada'
}
