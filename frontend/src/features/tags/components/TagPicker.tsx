import { useState } from 'react'
import { Combobox, useCombobox } from '@mantine/core'
import { Plus } from 'lucide-react'
import { SincraButton, TagPill } from '@/shared/components'
import type { Tag } from '../types/tag.types'

const CREATE_OPTION_VALUE = '__create__'
const MAX_TAG_NAME_LENGTH = 30

interface TagPickerProps {
  tags: Tag[]
  assignedTagIds: ReadonlySet<string>
  onSelect: (tag: Tag) => void
  onCreate: (name: string) => void
  isBusy?: boolean
}

export function TagPicker({
  tags,
  assignedTagIds,
  onSelect,
  onCreate,
  isBusy = false,
}: TagPickerProps) {
  const [search, setSearch] = useState<string>('')
  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption()
      setSearch('')
    },
    onDropdownOpen: () => combobox.focusSearchInput(),
  })

  const query = search.trim().toLowerCase()
  const availableTags = tags.filter(
    (tag) => !assignedTagIds.has(tag.id) && tag.name.toLowerCase().includes(query),
  )
  const sameNameTag = tags.find((tag) => tag.name.toLowerCase() === query)
  const canCreate = query !== '' && sameNameTag === undefined
  const isAlreadyAssigned = sameNameTag !== undefined && assignedTagIds.has(sameNameTag.id)

  function handleOptionSubmit(value: string) {
    if (value === CREATE_OPTION_VALUE) {
      onCreate(search.trim())
    } else {
      const selectedTag = tags.find((tag) => tag.id === value)
      if (selectedTag) onSelect(selectedTag)
    }
    combobox.closeDropdown()
  }

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleOptionSubmit}
      width={260}
      position="bottom-start"
    >
      <Combobox.Target>
        <SincraButton
          variant="secondary"
          size="sm"
          disabled={isBusy}
          onClick={() => combobox.toggleDropdown()}
        >
          <Plus size={14} aria-hidden="true" />
          Añadir etiqueta
        </SincraButton>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Buscar o crear etiqueta"
          aria-label="Buscar o crear etiqueta"
          maxLength={MAX_TAG_NAME_LENGTH}
        />
        <Combobox.Options>
          {availableTags.map((tag) => (
            <Combobox.Option key={tag.id} value={tag.id}>
              <TagPill name={tag.name} color={tag.color} />
            </Combobox.Option>
          ))}
          {canCreate && (
            <Combobox.Option value={CREATE_OPTION_VALUE}>Crear «{search.trim()}»</Combobox.Option>
          )}
          {availableTags.length === 0 && !canCreate && (
            <Combobox.Empty>
              {isAlreadyAssigned ? 'Ya tiene esa etiqueta' : 'No hay más etiquetas'}
            </Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
