import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi } from 'vitest'
import { TagPicker } from './TagPicker'
import type { Tag } from '../types/tag.types'

const vip: Tag = { id: 'tag-vip', name: 'VIP', color: '#ffb800', priority: 'LOW', isDefault: true }
const urgent: Tag = {
  id: 'tag-urgent',
  name: 'Urgente',
  color: '#e5484d',
  priority: 'LOW',
  isDefault: true,
}
const wholesale: Tag = {
  id: 'tag-wholesale',
  name: 'Mayorista',
  color: '#3b91ff',
  priority: 'LOW',
  isDefault: false,
}

function renderPicker(props: Partial<React.ComponentProps<typeof TagPicker>> = {}) {
  const onSelect = vi.fn()
  const onCreate = vi.fn()
  render(
    <MantineProvider env="test">
      <TagPicker
        tags={[vip, urgent, wholesale]}
        assignedTagIds={new Set([vip.id])}
        onSelect={onSelect}
        onCreate={onCreate}
        {...props}
      />
    </MantineProvider>,
  )
  return { onSelect, onCreate }
}

function openPicker() {
  fireEvent.click(screen.getByRole('button', { name: 'Añadir etiqueta' }))
}

describe('TagPicker', () => {
  // Given a catalog where one tag is already assigned
  // When the picker is opened
  // Then only the tags that are not assigned should be offered
  it('offers only the tags that are not assigned yet', async () => {
    renderPicker()

    openPicker()

    expect(await screen.findByRole('option', { name: 'Urgente' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Mayorista' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'VIP' })).not.toBeInTheDocument()
  })

  // Given the picker is open
  // When the user types in the search box
  // Then the options should be filtered by that text, ignoring case
  it('filters the options by the typed text', async () => {
    renderPicker()
    openPicker()

    fireEvent.change(await screen.findByLabelText('Buscar o crear etiqueta'), {
      target: { value: 'MAYO' },
    })

    expect(screen.getByRole('option', { name: 'Mayorista' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Urgente' })).not.toBeInTheDocument()
  })

  // Given the picker is open
  // When the user chooses an existing tag
  // Then onSelect should be called with that tag
  it('calls onSelect with the chosen tag', async () => {
    const { onSelect } = renderPicker()
    openPicker()

    fireEvent.click(await screen.findByRole('option', { name: 'Urgente' }))

    expect(onSelect).toHaveBeenCalledWith(urgent)
  })

  // Given a text that matches no tag of the catalog
  // When the user chooses "Crear"
  // Then onCreate should be called with the trimmed name
  it('offers to create a tag that does not exist', async () => {
    const { onCreate } = renderPicker()
    openPicker()

    fireEvent.change(await screen.findByLabelText('Buscar o crear etiqueta'), {
      target: { value: '  Nueva ' },
    })
    fireEvent.click(screen.getByRole('option', { name: 'Crear «Nueva»' }))

    expect(onCreate).toHaveBeenCalledWith('Nueva')
  })

  // Given a text equal to a tag of the catalog, whatever its case
  // When the user types it
  // Then creating should not be offered, to avoid duplicates
  it('does not offer to create a tag whose name already exists', async () => {
    renderPicker()
    openPicker()

    fireEvent.change(await screen.findByLabelText('Buscar o crear etiqueta'), {
      target: { value: 'urgente' },
    })

    expect(screen.queryByRole('option', { name: /Crear/ })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Urgente' })).toBeInTheDocument()
  })

  // Given the typed text equals a tag that is already assigned
  // When the user types it
  // Then it should say the client already has it instead of offering to create it
  it('says when the tag is already assigned', async () => {
    renderPicker()
    openPicker()

    fireEvent.change(await screen.findByLabelText('Buscar o crear etiqueta'), {
      target: { value: 'vip' },
    })

    expect(screen.getByText('Ya tiene esa etiqueta')).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Crear/ })).not.toBeInTheDocument()
  })

  // Given every tag is already assigned
  // When the picker is opened
  // Then an empty message should be shown
  it('shows an empty message when there is nothing left to add', async () => {
    renderPicker({ assignedTagIds: new Set([vip.id, urgent.id, wholesale.id]) })

    openPicker()

    expect(await screen.findByText('No hay más etiquetas')).toBeInTheDocument()
  })

  // Given the parent is busy saving
  // When the picker is rendered
  // Then the button should be disabled
  it('disables the button while busy', () => {
    renderPicker({ isBusy: true })

    expect(screen.getByRole('button', { name: 'Añadir etiqueta' })).toBeDisabled()
  })
})
