import { describe, it, expect } from 'vitest'
import { isSincroNote, sincroNoteBody } from './sincroNote'

describe('isSincroNote', () => {
  // Given a note whose text starts with the AI prefix
  // When it is checked
  // Then it belongs to Sincro, even if a person is stored as the author
  it('matches a note that starts with the AI prefix', () => {
    expect(
      isSincroNote({ content: 'Sugerido por IA: llamar el viernes', createdBy: 'user-1' }),
    ).toBe(true)
  })

  // Given a note with no author and no prefix
  // When it is checked
  // Then it still belongs to Sincro
  it('matches a note with no author', () => {
    expect(isSincroNote({ content: 'Llamar mañana', createdBy: null })).toBe(true)
  })

  // Given a note a person wrote
  // When it is checked
  // Then it does not belong to Sincro
  it('leaves a person note alone', () => {
    expect(isSincroNote({ content: 'Prefiere WhatsApp', createdBy: 'user-1' })).toBe(false)
  })
})

describe('sincroNoteBody', () => {
  // Given a note that starts with the AI prefix
  // When the visible text is prepared
  // Then the prefix and the space after it are gone
  it('drops the AI prefix', () => {
    expect(sincroNoteBody('Sugerido por IA: Quiere el pedido el viernes')).toBe(
      'Quiere el pedido el viernes',
    )
  })

  // Given a prefix with extra space in front and after the colon
  // When the visible text is prepared
  // Then only the note itself remains
  it('drops a padded prefix', () => {
    expect(sincroNoteBody('  Sugerido por IA:\n\nHola')).toBe('Hola')
  })

  // Given a note that is only the prefix
  // When the visible text is prepared
  // Then nothing is left to show under the Sincro line
  it('returns an empty body when the note is only the prefix', () => {
    expect(sincroNoteBody('Sugerido por IA:')).toBe('')
  })

  // Given a note without the prefix
  // When the visible text is prepared
  // Then the text stays as it was written
  it('keeps a note that has no prefix', () => {
    expect(sincroNoteBody('Llamar mañana')).toBe('Llamar mañana')
  })
})
