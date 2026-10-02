interface ClientDetailPanelProps {
  id: string
}

export function ClientDetailPanel({ id }: ClientDetailPanelProps) {
  return <p className="text-ink-muted">Cliente: {id}</p>
}
