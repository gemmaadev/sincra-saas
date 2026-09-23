import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorHandler'
import { asyncHandler } from './shared/asyncHandler'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())

app.get(
  '/health',
  asyncHandler(async (req, res) => {
    res.json({ status: 'ok' })
  }),
)

app.use(errorHandler)

export default app
