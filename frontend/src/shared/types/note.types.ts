export interface Note {
  id: string
  clientId: string | null
  orderId: string | null
  content: string
  createdBy: string | null
  createdAt: string
}
