import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Table } from './Table'
import type { Column, TableSelection } from './table.types'

interface FakeRow {
  id: string
  name: string
}

const columns: Column<FakeRow>[] = [{ key: 'name', header: 'Nombre' }]

const data: FakeRow[] = [
  { id: '1', name: 'Laura García' },
  { id: '2', name: 'Carlos Ruiz' },
]

describe('Table', () => {
  // Given a Table with columns and data
  // When it is rendered
  // Then the header and every row's value should be visible
  it('renders the column headers and the data rows', () => {
    render(<Table columns={columns} data={data} getRowKey={(row) => row.id} />)
    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Laura García')).toBeInTheDocument()
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument()
  })

  // Given a column with a custom render function
  // When the table is rendered
  // Then the custom content should be shown instead of the raw value
  it('uses the custom render function when a column defines one', () => {
    const customColumns: Column<FakeRow>[] = [
      {
        key: 'name',
        header: 'Nombre',
        render: (row) => <strong>{row.name.toUpperCase()}</strong>,
      },
    ]
    render(<Table columns={customColumns} data={data} getRowKey={(row) => row.id} />)
    expect(screen.getByText('LAURA GARCÍA')).toBeInTheDocument()
  })

  // Given a Table with an onRowClick handler
  // When the user clicks on a row
  // Then the handler should receive that row's data
  it('calls onRowClick with the clicked row when a row is clicked', () => {
    const onRowClick = vi.fn()
    render(
      <Table columns={columns} data={data} getRowKey={(row) => row.id} onRowClick={onRowClick} />,
    )
    const row = screen.getByText('Laura García').closest('tr')
    fireEvent.click(row!)
    expect(onRowClick).toHaveBeenCalledWith(data[0])
  })

  // Given a Table with no data and an emptyState provided
  // When it is rendered
  // Then the empty state should be shown instead of an empty table
  it('renders the empty state when there is no data', () => {
    render(
      <Table
        columns={columns}
        data={[]}
        getRowKey={(row) => row.id}
        emptyState={<p>Sin resultados</p>}
      />,
    )
    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
  })

  describe('with row selection', () => {
    function buildSelection(selectedKeys: string[] = []): TableSelection<FakeRow> {
      return {
        selectedKeys: new Set(selectedKeys),
        onToggleRow: vi.fn(),
        onToggleAll: vi.fn(),
        getRowLabel: (row) => `Seleccionar ${row.name}`,
      }
    }

    // Given a Table without the selection prop
    // When it is rendered
    // Then no checkbox should be shown
    it('shows no checkboxes when selection is not provided', () => {
      render(<Table columns={columns} data={data} getRowKey={(row) => row.id} />)

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    // Given a Table with selection
    // When it is rendered
    // Then there should be a select-all checkbox and one named checkbox per row
    it('renders a select-all checkbox and one checkbox per row', () => {
      render(
        <Table
          columns={columns}
          data={data}
          getRowKey={(row) => row.id}
          selection={buildSelection()}
        />,
      )

      expect(screen.getByRole('checkbox', { name: 'Seleccionar todos' })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: 'Seleccionar Laura García' })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: 'Seleccionar Carlos Ruiz' })).toBeInTheDocument()
    })

    // Given some selected rows
    // When the Table is rendered
    // Then only those row checkboxes should be checked
    it('checks the selected rows', () => {
      render(
        <Table
          columns={columns}
          data={data}
          getRowKey={(row) => row.id}
          selection={buildSelection(['2'])}
        />,
      )

      expect(screen.getByRole('checkbox', { name: 'Seleccionar Laura García' })).not.toBeChecked()
      expect(screen.getByRole('checkbox', { name: 'Seleccionar Carlos Ruiz' })).toBeChecked()
    })

    // Given every row is selected
    // When the Table is rendered
    // Then the select-all checkbox should be checked, and indeterminate when only some are
    it('reflects all and some selected rows in the select-all checkbox', () => {
      const { rerender } = render(
        <Table
          columns={columns}
          data={data}
          getRowKey={(row) => row.id}
          selection={buildSelection(['1', '2'])}
        />,
      )
      const selectAll = screen.getByRole('checkbox', {
        name: 'Seleccionar todos',
      }) as HTMLInputElement
      expect(selectAll).toBeChecked()
      expect(selectAll.indeterminate).toBe(false)

      rerender(
        <Table
          columns={columns}
          data={data}
          getRowKey={(row) => row.id}
          selection={buildSelection(['1'])}
        />,
      )
      expect(selectAll).not.toBeChecked()
      expect(selectAll.indeterminate).toBe(true)
    })

    // Given a Table with selection
    // When the user clicks a row checkbox and the select-all checkbox
    // Then the matching callbacks should be called
    it('calls onToggleRow with the row key and onToggleAll', () => {
      const selection = buildSelection()
      render(
        <Table columns={columns} data={data} getRowKey={(row) => row.id} selection={selection} />,
      )

      fireEvent.click(screen.getByRole('checkbox', { name: 'Seleccionar Carlos Ruiz' }))
      fireEvent.click(screen.getByRole('checkbox', { name: 'Seleccionar todos' }))

      expect(selection.onToggleRow).toHaveBeenCalledWith('2')
      expect(selection.onToggleAll).toHaveBeenCalledTimes(1)
    })

    // Given clickable rows with selection
    // When the user clicks a row checkbox
    // Then the row click (e.g. opening the detail) should not fire
    it('does not trigger onRowClick when a checkbox is clicked', () => {
      const onRowClick = vi.fn()
      render(
        <Table
          columns={columns}
          data={data}
          getRowKey={(row) => row.id}
          onRowClick={onRowClick}
          selection={buildSelection()}
        />,
      )

      fireEvent.click(screen.getByRole('checkbox', { name: 'Seleccionar Laura García' }))

      expect(onRowClick).not.toHaveBeenCalled()
    })

    // Given clickable rows with selection
    // When the user presses Space on a row checkbox
    // Then the row should not be activated
    it('does not trigger onRowClick when a key is pressed on a checkbox', () => {
      const onRowClick = vi.fn()
      render(
        <Table
          columns={columns}
          data={data}
          getRowKey={(row) => row.id}
          onRowClick={onRowClick}
          selection={buildSelection()}
        />,
      )

      fireEvent.keyDown(screen.getByRole('checkbox', { name: 'Seleccionar Laura García' }), {
        key: ' ',
      })

      expect(onRowClick).not.toHaveBeenCalled()
    })
  })
})
