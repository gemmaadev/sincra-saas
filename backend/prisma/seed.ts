// Example/demo data only. WhatsApp, Instagram and Messenger have no real adapter or
// inbox yet (not MVP) — the channels values below are just metadata on the Client record. Gmail/Outlook are real OAuth integrations elsewhere in the app.

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
const CLIENT_TYPES = ['particular', 'mayorista', 'autónomo', 'empresa', 'distribuidor'] as const

// 25 unique people + 3 repeated on purpose
// to demo "possible duplicate" detection later.
const DEMO_NAMES = [
  'Laura García',
  'Carlos Ruiz',
  'Ana Torres',
  'Javier Martín',
  'Marta López',
  'Elena Fernández',
  'Pablo Sánchez',
  'Lucía Gómez',
  'José Martínez',
  'Cristina Rodríguez',
  'Marc Soler',
  'Nuria Puig',
  'Jordi Ferran',
  'Anna Vidal',
  'David Serra',
  'Sara Font',
  'Alex Roca',
  'Clara Mas',
  'Daniel Prat',
  'Irene Call',
  'Oriol Bosch',
  'Paula Riera',
  'Marc Soler', // duplicate 1: same person, different channel/city on purpose
  'Anna Vidal', // duplicate 2
  'David Serra', // duplicate 3
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
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '.')
}

interface CatalogItem {
  product: string
  description?: string
  unitPrice: number
}

const PRODUCT_CATALOG: CatalogItem[] = [
  { product: 'Chaqueta oversize', description: 'Talla M, beige', unitPrice: 89.9 },
  { product: 'Zapatillas urbanas', description: 'Talla 42, negro', unitPrice: 59.9 },
  { product: 'Camiseta personalizada', description: 'Talla L, blanco', unitPrice: 24.9 },
  { product: 'Pack 3 camisetas', description: 'Tallas M, L, XL, colores varios', unitPrice: 49.9 },
  { product: 'Bolso de piel', description: 'Color marrón', unitPrice: 129.9 },
  { product: 'Sudadera con capucha', description: 'Talla L, gris', unitPrice: 54.9 },
  { product: 'Pantalón vaquero', description: 'Talla 38, azul', unitPrice: 39.9 },
  { product: 'Gorra personalizada', description: 'Talla única, negra', unitPrice: 19.9 },
  { product: 'Mochila urbana', description: 'Color negro', unitPrice: 69.9 },
  { product: 'Pañuelo de seda', unitPrice: 15 },
]

const ORDER_KIND_POOL: OrderKind[] = ['PRODUCT', 'PRODUCT', 'PRODUCT', 'PRODUCT', 'SERVICE']

// Weighted so most demo orders are already resolved one way or another,
// with cancellations being the rarer case (closer to how a real shop looks).
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

// Builds a believable status history leading up to the final status, instead of
// a single entry — useful once the order detail timeline gets built.
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

  // Idempotent: clear previously-seeded data before reseeding. Orders must go first —
  // the schema blocks deleting a client that still has orders (onDelete: NoAction).
  await prisma.order.deleteMany({ where: { businessId } })
  await prisma.client.deleteMany({ where: { businessId } })
  await prisma.tag.deleteMany({ where: { businessId } })

  const tags = await Promise.all(
    DEFAULT_TAGS.map((tag) =>
      prisma.tag.create({
        data: { businessId, name: tag.name, color: tag.color, isDefault: true },
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
  }

  const ordersCreated = await seedOrders(businessId, clients)

  console.log(
    `Seed completado: ${created} clientes, ${tags.length} etiquetas por defecto y ${ordersCreated} pedidos para el negocio ${businessId}.`,
  )
}

async function seedOrders(businessId: string, clients: Client[]): Promise<number> {
  const ORDERS_TO_CREATE = 60

  // Order numbers increase over time in real use — generate the random dates
  // first and sort them, so the number assigned below stays chronological.
  const createdAtDates = Array.from({ length: ORDERS_TO_CREATE }, () => randomPastDate(45)).sort(
    (a, b) => a.getTime() - b.getTime(),
  )

  for (let index = 0; index < ORDERS_TO_CREATE; index += 1) {
    const client = pickRandom(clients)
    const status = pickRandom(ORDER_STATUS_POOL)
    const itemsCount = Math.random() < 0.75 ? 1 : 2
    const items = Array.from({ length: itemsCount }, () => pickRandom(PRODUCT_CATALOG))
    const price = items.reduce((total, item) => total + item.unitPrice, 0)
    const createdAt = createdAtDates[index]
    const channel = Math.random() < 0.7 && client.channels.length > 0
      ? pickRandom(client.channels)
      : undefined

    await prisma.order.create({
      data: {
        businessId,
        clientId: client.id,
        number: index + 1,
        channel,
        kind: pickRandom(ORDER_KIND_POOL),
        price,
        createdAt,
        expectedDate: Math.random() < 0.6 ? randomFutureDate(createdAt, 10) : undefined,
        items: { create: items.map((item) => ({ ...item })) },
        statusHistory: { create: buildStatusHistory(status) },
        status,
      },
    })
  }

  return ORDERS_TO_CREATE
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
