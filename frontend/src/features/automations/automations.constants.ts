export interface AiAgent {
  id: 'sincra' | 'sincro'
  name: string
  role: string
  tagline: string
  avatar: string
  description: string
  capabilities: string[]
}

export const AI_AGENTS: AiAgent[] = [
  {
    id: 'sincra',
    name: 'Sincra',
    role: 'Lee tus mensajes por ti',
    tagline: 'Encuentra clientes y pedidos nuevos antes de que tengas que buscarlos.',
    avatar: '/avatar-sincra-agent.png',
    description:
      'Revisa los mensajes que te llegan de todos los sitios y detecta cuándo hay un cliente o un pedido, sin que tengas que leerlos tú.',
    capabilities: [
      'Sabe si quien escribe es un cliente nuevo o uno que ya conoces',
      'Identifica por qué canal te ha llegado el contacto',
      'Reconoce cuándo alguien quiere comprar y extrae los datos del pedido',
      'Se lo pasa todo a Sincro para que lo guarde',
    ],
  },
  {
    id: 'sincro',
    name: 'Sincro',
    role: 'Lo deja todo guardado',
    tagline: 'Guarda lo que detecta Sincra como clientes y pedidos nuevos.',
    avatar: '/avatar-sincro-agent.png',
    description:
      'Coge lo que encuentra Sincra y lo deja listo en tu negocio: da de alta un cliente nuevo o lo une al que ya tenías.',
    capabilities: [
      'Reconoce cuándo el cliente ya existe y lo reutiliza',
      'Da de alta un cliente nuevo cuando no hay coincidencia',
      'Crea el pedido y lo deja vinculado al cliente correcto',
      'Marca todo lo que crea como "Sugerido por IA"',
    ],
  },
]
