import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { errorHandler } from './shared/handlers/errorHandler'
import { asyncHandler } from './shared/handlers/asyncHandler'
import authRoutes from './features/auth/auth.routes'
import userRoutes from './features/user/user.routes'
import teamRoutes from './features/team/team.routes'
import clientRoutes from './features/client/client.routes'
import tagRoutes from './features/tag/tag.routes'
import noteRoutes from './features/note/note.routes'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

app.use(authRoutes)
app.use(userRoutes)
app.use(teamRoutes)
app.use(clientRoutes)
app.use(tagRoutes)
app.use(noteRoutes)

app.get(
  '/health',
  asyncHandler(async (req, res) => {
    res.json({ status: 'ok' })
  }),
)

app.use(errorHandler)

export default app
