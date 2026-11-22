// Example/demo data only — WhatsApp/Instagram/Messenger are just metadata here, no real adapter yet.
// Run with: npx prisma db seed
import 'dotenv/config'
import prisma from '../src/config/db'
import type { Channel, Client, OrderKind, OrderStatus } from '../src/generated/prisma/client'
import { DEFAULT_TAGS } from '../src/shared/defaultTags'

const SEED_BUSINESS_OWNER_EMAIL = process.env.SEED_BUSINESS_EMAIL

if (!SEED_BUSINESS_OWNER_EMAIL) {
  throw new Error(
    'Falta SEED_BUSINESS_EMAIL en el .env — pon el email de la cuenta cuyo negocio quieres sembrar.',
  )
}

interface City {
  zone: string
  address: string
  latitude: number
  longitude: number
}

const CITIES: City[] = [
  { zone: 'Barcelona', address: 'Carrer de Mallorca 123', latitude: 41.3851, longitude: 2.1734 },
  { zone: 'Girona', address: 'Carrer de Santa Clara 12', latitude: 41.9794, longitude: 2.8214 },
  { zone: 'Tarragona', address: 'Rambla Nova 45', latitude: 41.1189, longitude: 1.2445 },
  { zone: 'Lleida', address: 'Avinguda de Catalunya 8', latitude: 41.6176, longitude: 0.62 },
  { zone: 'Sabadell', address: 'Carrer de Sant Pau 33', latitude: 41.5463, longitude: 2.1086 },
  { zone: 'Terrassa', address: 'Carrer de la Rasa 21', latitude: 41.5636, longitude: 2.0085 },
  { zone: 'Badalona', address: 'Avinguda de Martí Pujol 67', latitude: 41.45, longitude: 2.2474 },
  { zone: 'Mataró', address: 'Carrer de la Riera 14', latitude: 41.5381, longitude: 2.4445 },
  { zone: 'Reus', address: 'Carrer de Llovera 9', latitude: 41.1561, longitude: 1.1069 },
  { zone: 'Manresa', address: 'Carrer del Born 5', latitude: 41.723, longitude: 1.8268 },
  { zone: 'Vic', address: 'Plaça Major 3', latitude: 41.9301, longitude: 2.2545 },
  { zone: 'Figueres', address: 'Rambla 22', latitude: 42.2667, longitude: 2.9617 },
  {
    zone: 'Vilanova i la Geltrú',
    address: 'Rambla Principal 18',
    latitude: 41.2241,
    longitude: 1.7252,
  },
  { zone: 'Madrid', address: 'Calle de Alcalá 200', latitude: 40.4168, longitude: -3.7038 },
  { zone: 'Valencia', address: 'Carrer de Colón 55', latitude: 39.4699, longitude: -0.3763 },
  { zone: 'Sevilla', address: 'Calle Sierpes 10', latitude: 37.3891, longitude: -5.9845 },
  { zone: 'Bilbao', address: 'Gran Vía 30', latitude: 43.263, longitude: -2.935 },
]

const CHANNEL_POOL: Channel[] = ['GMAIL', 'OUTLOOK', 'WHATSAPP', 'INSTAGRAM', 'MESSENGER']
const CLIENT_TYPES = ['restaurante', 'bar', 'hotel', 'frutería', 'distribuidor'] as const

// 25 unique businesses + 3 repeated on purpose, to demo "possible duplicate" detection later
const DEMO_NAMES = [
  'Laura García (Restaurant Can García)',
  'Carlos Ruiz (Bar Ruiz)',
  'Ana Torres (Hotel Torres)',
  'Javier Martín (Frutería Martín)',
  'Marta López (Restaurant La Lloreta)',
  'Elena Fernández (Bar Fernández)',
  'Pablo Sánchez (Hotel Can Sánchez)',
  'Lucía Gómez (Frutería Gómez)',
  'José Martínez (Restaurant Martínez)',
  'Cristina Rodríguez (Bar Rodríguez)',
  'Marc Soler (Hotel Soler)',
  'Nuria Roig (Fruites Roig)',
  'Jordi Ferran (Cafès Ferran)',
  'Anna Vidal (Restaurant Vidal)',
  'David Serra (Bar La Serra)',
  'Sara Font (Hotel Font)',
  'Alex Roca (Bar Can Roca)',
  'Clara Mas (Pastisseria Can Mas)',
  'Daniel Prat (Restaurant Can Prat)',
  'Irene Call (Frutería Call)',
  'Oriol Bosch (Hotel Bosch)',
  'Paula Riera (Bar Riera)',
  'Marc Soler (Hotel Soler)', // duplicate 1: same business, different channel/city on purpose
  'Anna Vidal (Restaurant Vidal)', // duplicate 2
  'David Serra (Bar La Serra)', // duplicate 3
]

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function pickRandomChannels(): Channel[] {
  const count = Math.random() < 0.8 ? 1 : 2
  const shuffled = [...CHANNEL_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[()]/g, '')
    .trim()
    .replace(/\s+/g, '.')
}

interface CatalogItem {
  product: string
  unit: string
  minQty: number
  maxQty: number
  unitPrice: number | null
}

interface OrderLine {
  product: string
  description: string
  quantity: number
  unitPrice: number | null
}

function buildOrderLine(item: CatalogItem): OrderLine {
  const quantity = Math.floor(item.minQty + Math.random() * (item.maxQty - item.minQty + 1))
  return {
    product: item.product,
    description: item.unit,
    quantity,
    unitPrice: item.unitPrice,
  }
}

// Mirrors how a real order's price is computed server-side: sum(unitPrice * quantity)
function priceFromLines(lines: OrderLine[]): number | null {
  if (lines.length === 0) return null

  let total = 0
  for (const line of lines) {
    if (line.unitPrice == null) return null
    total += line.unitPrice * line.quantity
  }

  return Math.round(total * 100) / 100
}

const PRODUCT_CATALOG: CatalogItem[] = [
  { product: 'Tomate pera', unit: 'kg', minQty: 10, maxQty: 40, unitPrice: 1.85 },
  { product: 'Lechuga romana', unit: 'cajas', minQty: 2, maxQty: 10, unitPrice: 12.9 },
  { product: 'Cebolla tierna', unit: 'manojos', minQty: 4, maxQty: 12, unitPrice: 2.4 },
  { product: 'Pimiento rojo', unit: 'kg', minQty: 8, maxQty: 30, unitPrice: 1.99 },
  { product: 'Aceite de oliva virgen extra', unit: 'garrafas de 5L', minQty: 1, maxQty: 4, unitPrice: 34.9 },
  { product: 'Patata', unit: 'sacos de 25kg', minQty: 1, maxQty: 3, unitPrice: 22.5 },
  { product: 'Harina de trigo', unit: 'sacos de 25kg', minQty: 1, maxQty: 2, unitPrice: 19.9 },
  { product: 'Bolsas kraft con logo', unit: 'packs de 500 uds', minQty: 1, maxQty: 3, unitPrice: 89.9 },
  { product: 'Calabacín', unit: 'kg', minQty: 10, maxQty: 25, unitPrice: 1.35 },
  { product: 'Fruta de temporada variada', unit: 'cajas mixtas de 15kg', minQty: 1, maxQty: 4, unitPrice: 27.9 },
  { product: 'Pan de pagès', unit: 'uds', minQty: 10, maxQty: 30, unitPrice: 3.2 },
  { product: 'Queso curado', unit: 'piezas', minQty: 1, maxQty: 5, unitPrice: 14.5 },
]

const CLIENT_NOTES = [
  'Cliente habitual, pide todos los lunes por la mañana.',
  'Prefiere pago por transferencia a 30 días, no en efectivo.',
  'Pide confirmación de entrega antes de las 9:00.',
  'Avisar por WhatsApp antes de llegar, el acceso de carga es complicado.',
  'Factura siempre a nombre de la sociedad, no del contacto personal.',
  'Hace pedidos grandes los jueves, de cara al fin de semana.',
  'Cliente nuevo, primera entrega hace un par de semanas.',
  'Ha tenido un problema con un pedido anterior, revisar con cuidado.',
]

const ORDER_NOTES = [
  'Entregar antes de las 9:00, tienen el servicio de desayunos.',
  'Confirmar stock antes de salir, es un pedido grande.',
  'Cliente pidió cambiar la cantidad por teléfono a última hora.',
  'Pago contra entrega en efectivo.',
  'Pedido urgente, el cliente ha insistido varias veces.',
  'Repetir el pedido de la semana pasada, mismas cantidades.',
]

const ORDER_KIND_POOL: OrderKind[] = ['PRODUCT', 'PRODUCT', 'PRODUCT', 'PRODUCT', 'SERVICE']

// Weighted so most orders are resolved, cancellations are the rarer case
const ORDER_STATUS_POOL: OrderStatus[] = [
  'PENDING',
  'PENDING',
  'PREPARING',
  'PREPARING',
  'SHIPPED',
  'SHIPPED',
  'DELIVERED',
  'DELIVERED',
  'DELIVERED',
  'CANCELLED',
]

const STATUS_PROGRESSION: OrderStatus[] = ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED']

function buildStatusHistory(finalStatus: OrderStatus) {
  if (finalStatus === 'CANCELLED') {
    return [{ status: 'PENDING' as OrderStatus }, { status: 'CANCELLED' as OrderStatus }]
  }

  const finalIndex = STATUS_PROGRESSION.indexOf(finalStatus)
  return STATUS_PROGRESSION.slice(0, finalIndex + 1).map((status) => ({ status }))
}

function randomPastDate(maxDaysAgo: number): Date {
  const daysAgo = Math.random() * maxDaysAgo
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
}

function randomFutureDate(from: Date, maxDaysAhead: number): Date {
  const daysAhead = Math.random() * maxDaysAhead
  return new Date(from.getTime() + daysAhead * 24 * 60 * 60 * 1000)
}

async function main() {
  const owner = await prisma.user.findUnique({
    where: { email: SEED_BUSINESS_OWNER_EMAIL },
    include: { memberships: true },
  })

  if (!owner || owner.memberships.length === 0) {
    throw new Error(
      `No se encontró ningún negocio para ${SEED_BUSINESS_OWNER_EMAIL}. Regístrate/inicia sesión con esa cuenta primero.`,
    )
  }

  const businessId = owner.memberships[0].businessId

  await prisma.business.update({ where: { id: businessId }, data: { name: 'Horta Fresca' } })

  // Never touch aiGenerated rows — those are real, written by Sincro
  await prisma.order.deleteMany({ where: { businessId, aiGenerated: false } })
  await prisma.client.deleteMany({ where: { businessId, aiGenerated: false } })

  // Upsert, not delete+recreate — a tag id must stay stable across reseeds
  const tags = await Promise.all(
    DEFAULT_TAGS.map((tag) =>
      prisma.tag.upsert({
        where: { businessId_name: { businessId, name: tag.name } },
        update: {},
        create: { businessId, name: tag.name, color: tag.color, isDefault: true },
      }),
    ),
  )

  let created = 0
  const clients: Client[] = []

  for (let index = 0; index < DEMO_NAMES.length; index += 1) {
    const name = DEMO_NAMES[index]
    const city = pickRandom(CITIES)
    const channels = pickRandomChannels()
    const uniqueSuffix = `${slugify(name)}-${index}`

    const client = await prisma.client.create({
      data: {
        businessId,
        name,
        email: `${uniqueSuffix}@ejemplo.test`,
        phone: `+346${(10000000 + index * 137).toString().slice(0, 8)}`,
        channels,
        type: pickRandom(CLIENT_TYPES),
        zone: city.zone,
        address: city.address,
        latitude: city.latitude,
        longitude: city.longitude,
      },
    })
    created += 1
    clients.push(client)

    // Tag roughly a third of the demo clients, so the Etiquetas UI has something to show
    if (Math.random() < 0.3) {
      await prisma.clientTag.create({ data: { clientId: client.id, tagId: pickRandom(tags).id } })
    }

    if (Math.random() < 0.4) {
      await prisma.note.create({
        data: { clientId: client.id, content: pickRandom(CLIENT_NOTES) },
      })
    }
  }

  const ordersCreated = await seedOrders(businessId, clients)

  console.log(
    `Seed completado: ${created} clientes, ${tags.length} etiquetas por defecto y ${ordersCreated} pedidos para el negocio ${businessId}.`,
  )
}

async function seedOrders(businessId: string, clients: Client[]): Promise<number> {
  const ORDERS_TO_CREATE = 60

  // Sorted so the order number assigned below stays chronological
  const createdAtDates = Array.from({ length: ORDERS_TO_CREATE }, () => randomPastDate(45)).sort(
    (a, b) => a.getTime() - b.getTime(),
  )

  for (let index = 0; index < ORDERS_TO_CREATE; index += 1) {
    const client = pickRandom(clients)
    const status = pickRandom(ORDER_STATUS_POOL)
    const itemsCount = Math.random() < 0.75 ? 1 : 2
    const lines = Array.from({ length: itemsCount }, () => buildOrderLine(pickRandom(PRODUCT_CATALOG)))
    const price = priceFromLines(lines)
    const createdAt = createdAtDates[index]
    const channel =
      Math.random() < 0.7 && client.channels.length > 0 ? pickRandom(client.channels) : undefined

    const order = await prisma.order.create({
      data: {
        businessId,
        clientId: client.id,
        number: index + 1,
        channel,
        kind: pickRandom(ORDER_KIND_POOL),
        price,
        createdAt,
        expectedDate: Math.random() < 0.6 ? randomFutureDate(createdAt, 10) : undefined,
        items: { create: lines },
        statusHistory: { create: buildStatusHistory(status) },
        status,
      },
    })

    if (Math.random() < 0.3) {
      await prisma.note.create({ data: { orderId: order.id, content: pickRandom(ORDER_NOTES) } })
    }
  }

  return ORDERS_TO_CREATE
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
