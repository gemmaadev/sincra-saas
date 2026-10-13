export interface StatsFilters {
  dateFrom?: string
  dateTo?: string
}

export interface StatsOverview {
  newClients: number
  ordersCreated: number
  averageDeliveryDays: number | null
  revenue: string
}
