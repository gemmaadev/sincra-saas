// Example/demo data only. WhatsApp, Instagram and Messenger have no real adapter or
// inbox yet (not MVP) — the channels values below are just metadata on the Client record. Gmail/Outlook are real OAuth integrations elsewhere in the app.

// Run with: npx prisma db seed
import 'dotenv/config'
import prisma from '../src/config/db'
import type { Channel } from '../src/generated/prisma/client'
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

  // Idempotent: clear previously-seeded clients and tags for this business before reseeding
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

    // Tag roughly a third of the demo clients, so the Etiquetas UI has something to show
    if (Math.random() < 0.3) {
      await prisma.clientTag.create({ data: { clientId: client.id, tagId: pickRandom(tags).id } })
    }
  }

  console.log(
    `Seed completado: ${created} clientes y ${tags.length} etiquetas por defecto para el negocio ${businessId}.`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
