import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveRegisterCredentials,
  getRegisterCredentials,
  clearRegisterCredentials,
} from './registerCredentials'

describe('registerCredentials', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  // Given no credentials have been saved yet
  // When reading them
  // Then it should return null instead of throwing
  it('returns null when nothing has been saved', () => {
    expect(getRegisterCredentials()).toBeNull()
  })

  // Given a set of credentials
  // When saved and then read back
  // Then the exact same data should come back
  it('round-trips saved credentials through sessionStorage', () => {
    saveRegisterCredentials({ name: 'Laura', email: 'laura@tienda.com', password: 'secreta123' })

    expect(getRegisterCredentials()).toEqual({
      name: 'Laura',
      email: 'laura@tienda.com',
      password: 'secreta123',
    })
  })

  // Given previously saved credentials
  // When cleared
  // Then reading them again should return null
  it('clears saved credentials', () => {
    saveRegisterCredentials({ name: 'Laura', email: 'laura@tienda.com', password: 'secreta123' })

    clearRegisterCredentials()

    expect(getRegisterCredentials()).toBeNull()
  })
})
