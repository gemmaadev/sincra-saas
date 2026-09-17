import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Table } from './Table'
import type { Column } from './table.types'

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
})
