import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRowSelection } from './useRowSelection'

describe('useRowSelection', () => {
  // Given a list of rows
  // When the hook starts
  // Then nothing should be selected
  it('starts with no selection', () => {
    const { result } = renderHook(() => useRowSelection(['a', 'b']))

    expect(result.current.selectedCount).toBe(0)
  })

  // Given a list of rows
  // When a row is toggled twice
  // Then it should be selected and then deselected
  it('selects and deselects a row', () => {
    const { result } = renderHook(() => useRowSelection(['a', 'b']))

    act(() => result.current.toggleRow('a'))
    expect(result.current.selectedKeys.has('a')).toBe(true)
    expect(result.current.selectedCount).toBe(1)

    act(() => result.current.toggleRow('a'))
    expect(result.current.selectedCount).toBe(0)
  })

  // Given some rows selected
  // When toggleAll is called
  // Then every row should be selected, and a second call should deselect them all
  it('selects every row and then deselects them all', () => {
    const { result } = renderHook(() => useRowSelection(['a', 'b', 'c']))
    act(() => result.current.toggleRow('a'))

    act(() => result.current.toggleAll())
    expect(result.current.selectedCount).toBe(3)

    act(() => result.current.toggleAll())
    expect(result.current.selectedCount).toBe(0)
  })

  // Given a selection
  // When clear is called
  // Then nothing should be selected
  it('clears the selection', () => {
    const { result } = renderHook(() => useRowSelection(['a', 'b']))
    act(() => result.current.toggleAll())

    act(() => result.current.clear())

    expect(result.current.selectedCount).toBe(0)
  })

  // Given rows selected on one page
  // When the visible rows change (another page) and more rows are selected
  // Then the selection should keep the rows of both pages
  it('keeps the selection across pages', () => {
    const { result, rerender } = renderHook(({ keys }) => useRowSelection(keys), {
      initialProps: { keys: ['a', 'b'] },
    })
    act(() => result.current.toggleAll())

    rerender({ keys: ['c', 'd'] })
    act(() => result.current.toggleRow('c'))

    expect(result.current.selectedCount).toBe(3)
    expect(result.current.selectedKeys.has('a')).toBe(true)
    expect(result.current.selectedKeys.has('c')).toBe(true)
  })

  // Given rows selected on two pages
  // When toggleAll is used on the second page while all its rows are selected
  // Then only that page's rows should be deselected
  it('toggles only the visible rows with toggleAll', () => {
    const { result, rerender } = renderHook(({ keys }) => useRowSelection(keys), {
      initialProps: { keys: ['a', 'b'] },
    })
    act(() => result.current.toggleAll())
    rerender({ keys: ['c', 'd'] })
    act(() => result.current.toggleAll())
    expect(result.current.selectedCount).toBe(4)

    act(() => result.current.toggleAll())

    expect(result.current.selectedCount).toBe(2)
    expect(result.current.selectedKeys.has('a')).toBe(true)
    expect(result.current.selectedKeys.has('c')).toBe(false)
  })

  // Given a selected row
  // When it is deselected by key (e.g. it was deleted elsewhere)
  // Then it should no longer count
  it('deselects a single row by key', () => {
    const { result } = renderHook(() => useRowSelection(['a', 'b']))
    act(() => result.current.toggleAll())

    act(() => result.current.deselect('a'))

    expect(result.current.selectedCount).toBe(1)
    expect(result.current.selectedKeys.has('a')).toBe(false)
  })
})
