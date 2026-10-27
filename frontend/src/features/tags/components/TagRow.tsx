import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { TAG_COLOR_PALETTE } from '../utils/pickTagColor'
import type { Tag } from '../types/tag.types'

const MAX_TAG_NAME_LENGTH = 30

interface TagRowProps {
  tag: Tag
  onRename: (name: string) => void
  onRecolor: (color: string) => void
  onDeleteRequest: (tag: Tag) => void
  disabled: boolean
}

export function TagRow({ tag, onRename, onRecolor, onDeleteRequest, disabled }: TagRowProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState(tag.name)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const paletteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isPaletteOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        setIsPaletteOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsPaletteOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPaletteOpen])

  function commitName() {
    setIsEditingName(false)
    const trimmed = name.trim()
    if (trimmed && trimmed !== tag.name) {
      onRename(trimmed)
    } else {
      setName(tag.name)
    }
  }

  return (
    <li className="flex items-center gap-3 py-2">
      <div className="relative" ref={paletteRef}>
        <button
          type="button"
          aria-label={`Cambiar color de ${tag.name}`}
          disabled={disabled}
          onClick={() => setIsPaletteOpen((value) => !value)}
          className="size-5 shrink-0 cursor-pointer rounded-full border border-neutral-200 disabled:cursor-not-allowed"
          style={{ backgroundColor: tag.color }}
        />
        {isPaletteOpen && (
          <div className="absolute top-full left-0 z-10 mt-2 flex gap-1 rounded-lg border border-neutral-100 bg-white p-2 shadow-md">
            {TAG_COLOR_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Color ${color}`}
                onClick={() => {
                  onRecolor(color)
                  setIsPaletteOpen(false)
                }}
                className="size-5 cursor-pointer rounded-full border border-neutral-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>

      {isEditingName ? (
        <input
          autoFocus
          value={name}
          maxLength={MAX_TAG_NAME_LENGTH}
          aria-label={`Nombre de ${tag.name}`}
          onChange={(event) => setName(event.target.value)}
          onBlur={commitName}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commitName()
            if (event.key === 'Escape') {
              setName(tag.name)
              setIsEditingName(false)
            }
          }}
          className="flex-1 rounded-lg border border-neutral-200 px-2 py-1 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsEditingName(true)}
          className="flex-1 cursor-pointer text-left text-sm text-ink hover:underline disabled:cursor-not-allowed"
        >
          {tag.name}
        </button>
      )}

      <button
        type="button"
        aria-label={`Eliminar etiqueta ${tag.name}`}
        disabled={disabled}
        onClick={() => onDeleteRequest(tag)}
        className="cursor-pointer rounded-full p-1.5 text-ink-muted transition-colors hover:bg-neutral-100 hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </li>
  )
}
