const STORAGE_KEY = 'registerCredentials'

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export function saveRegisterCredentials(credentials: RegisterCredentials) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
}

export function getRegisterCredentials(): RegisterCredentials | null {
  const stored = sessionStorage.getItem(STORAGE_KEY)
  return stored ? (JSON.parse(stored) as RegisterCredentials) : null
}

export function clearRegisterCredentials() {
  sessionStorage.removeItem(STORAGE_KEY)
}
