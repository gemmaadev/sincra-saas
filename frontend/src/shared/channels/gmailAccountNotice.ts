import { normalizedAccountEmail } from './connectedAccountLabel'

export function gmailAccountNotice(typedEmail: string | null, savedEmail: string | null) {
  const typed = normalizedAccountEmail(typedEmail)
  const saved = normalizedAccountEmail(savedEmail)
  if (!typed || !saved || typed === saved) return null
  return `El email escrito no coincide. Se ha conectado ${saved}.`
}
