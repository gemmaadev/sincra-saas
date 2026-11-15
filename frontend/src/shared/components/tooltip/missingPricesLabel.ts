export function missingPricesLabel(count: number): string {
  return count === 1 ? 'Falta el precio en 1 pedido' : `Faltan precios en ${count} pedidos`
}
