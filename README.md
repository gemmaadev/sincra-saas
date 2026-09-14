<div align="center">

### Sincra

Plataforma de gestión de comunicaciones y pedidos multicanal para pequeño comercio: bandeja unificada (Gmail, Outlook, WhatsApp, Instagram, Messenger), clientes, pedidos, calendario, mapa y agentes de IA.

🚧 **En desarrollo** — proyecto final del programa IT Academy (Barcelona Activa)

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-CA4245?logo=reactrouter&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?logo=reactquery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?logoColor=white)
<br>
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)

</div>

## Estado actual

Este proyecto está en construcción activa.

El desglose completo de tareas técnicas está en el [tablero de Trello](https://trello.com/b/FyBlMo8n/proyecto-final-sass).

## Qué resuelve

Sincra centraliza las comunicaciones de un pequeño comercio (email, WhatsApp, Instagram, Messenger) en una única bandeja, permite convertir cualquier conversación en un pedido con un clic, y añade agentes de IA que clasifican, sugieren respuestas y extraen datos de pedido automáticamente — todo con confirmación humana obligatoria antes de aplicar cualquier sugerencia.

### Funcionalidades previstas

- **Bandeja unificada**: todas las conversaciones (email real vía Gmail/Outlook, WhatsApp/Instagram/Messenger simulados en este MVP) en un solo lugar, con filtros, etiquetas y plantillas de respuesta
- **Clientes y mapa**: ficha de cliente con historial completo, geolocalización y detección de duplicados entre canales
- **Pedidos**: conversión directa de una conversación en pedido, con seguimiento de estado
- **Calendario**: seguimientos y entregas, con sincronización opcional a Google Calendar
- **Estadísticas**: rendimiento por canal, tiempos de respuesta, actividad de la IA
- **Agentes de IA**: clasificador de conversaciones, respuesta sugerida, extractor de pedidos y resumen de cliente
- **Equipo**: roles de administrador y empleado, con invitaciones por email

## Tech stack

| Categoría            | Tecnología                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------- |
| Framework frontend   | [React 19](https://react.dev/)                                                            |
| Lenguaje             | [TypeScript](https://www.typescriptlang.org/)                                             |
| Bundler              | [Vite](https://vitejs.dev/)                                                               |
| Estilos              | [Tailwind CSS v4](https://tailwindcss.com/)                                               |
| Enrutado             | [React Router](https://reactrouter.com/)                                                  |
| Estado remoto        | [TanStack Query](https://tanstack.com/query)                                              |
| Estado global        | [Zustand](https://github.com/pmndrs/zustand)                                              |
| Framework backend    | [Express](https://expressjs.com/)                                                         |
| ORM                  | [Prisma](https://www.prisma.io/)                                                          |
| Base de datos        | [PostgreSQL](https://www.postgresql.org/) (hosteada en [Supabase](https://supabase.com/)) |
| Autenticación        | Backend propio — JWT en cookie httpOnly + bcrypt                                          |
| Email real           | Gmail API y Microsoft Graph (OAuth)                                                       |
| IA                   | [API de Anthropic](https://docs.claude.com/)                                              |
| Testing              | [Vitest](https://vitest.dev/) + Testing Library + Supertest                               |
| Control de versiones | Git + GitHub (GitFlow)                                                                    |

## Empezar en local

> ⚠️ El proyecto aún no tiene todas las piezas montadas — estas instrucciones se irán completando a medida que exista algo que instalar y arrancar.

### Requisitos previos

- Node.js >= 20
- npm >= 9
- Una base de datos PostgreSQL (recomendado: [Supabase](https://supabase.com/), plan gratuito)
- Credenciales OAuth de Google Cloud Console y Azure App Registration (para Gmail/Outlook)
- Una clave de API de [Anthropic](https://console.anthropic.com/)

### 1. Clonar el repositorio

```bash
git clone https://github.com/gemmaadev/sincra-saas.git
cd sincra-saas
```

### 2. Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` en `backend/` (ver `.env.example` para la lista completa de variables).

```bash
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
```

Crea un archivo `.env` en `frontend/` (ver `.env.example`).

```bash
npm run dev
```

La app estará disponible en la URL que muestre la terminal (normalmente `http://localhost:5173`).

## Estructura del proyecto

```
sincra-saas/
├── backend/
│   └── src/
│       ├── app.ts
│       ├── config/
│       ├── middleware/
│       ├── shared/
│       └── features/
│           ├── auth/
│           ├── user/
│           ├── client/
│           ├── communication/
│           ├── order/
│           ├── calendar/
│           ├── ai/
│           ├── team/
│           └── settings/
│
└── frontend/
    └── src/
        ├── app/
        │   ├── layout/
        │   ├── router/
        │   └── providers/
        ├── pages/
        ├── shared/
        │   ├── components/
        │   ├── hooks/
        │   ├── services/
        │   └── utils/
        └── features/
            ├── auth/
            ├── inbox/
            ├── clients/
            ├── orders/
            ├── calendar/
            ├── map/
            ├── stats/
            ├── automations/
            ├── team/
            └── settings/
```

## Decisiones de arquitectura

- **Arquitectura basada en features**, tanto en frontend como en backend — cada dominio (auth, clientes, comunicaciones, pedidos...) agrupa sus propios componentes/hooks/tipos (frontend) o controladores/modelos (backend)
- **Auth propio en vez de un proveedor externo** (Firebase, Auth0...) — JWT firmado por el propio backend, guardado en cookie httpOnly, con bcrypt para el hash de contraseñas. Decisión tomada para tener control total sobre roles (admin/empleado) e invitaciones de equipo sin depender de la configuración de un tercero
- **Patrón ChannelAdapter** — Gmail y Outlook se conectan de verdad vía OAuth; WhatsApp, Instagram y Messenger están simulados en este MVP con la misma interfaz común (`fetchMessages`/`sendMessage`), de modo que sustituirlos por las APIs oficiales de Meta en el futuro no requiere tocar el resto de la arquitectura
- **Confirmación humana obligatoria para toda sugerencia de IA** — ningún agente (clasificador, respuesta sugerida, extractor de pedido) aplica cambios por sí solo; todo pasa por una acción explícita de la persona usuaria
- **Vinculación de comunicaciones a clientes por coincidencia exacta**, y **detección de duplicados entre canales por coincidencia de nombre** como una sugerencia aparte que también requiere confirmación — evita fusionar clientes distintos por error

_(Esta sección se irá ampliando con las decisiones reales tomadas durante el desarrollo — por ejemplo, por qué se descartó la sincronización con Google Calendar del MVP, o qué agentes de IA se priorizaron.)_

## Autora

**Gemma Maeso** · [@gemmaadev](https://github.com/gemmaadev)

Proyecto desarrollado como parte del programa **IT Academy** de Barcelona Activa
