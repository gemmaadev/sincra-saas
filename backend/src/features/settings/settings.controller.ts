import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { AppError } from '../../shared/AppError'
import { connectChannel, disconnectChannel } from './settings.service'
import type { ChannelActionBody } from './settings.types'

const VALID_CHANNELS = ['GMAIL', 'OUTLOOK', 'WHATSAPP', 'INSTAGRAM', 'MESSENGER']

export const connect = asyncHandler(async (req: Request, res: Response) => {
  const { channel } = req.body as ChannelActionBody

  if (!channel || !VALID_CHANNELS.includes(channel)) {
    throw new AppError('Canal no válido', 400, 'INVALID_CHANNEL')
  }

  const connectedChannel = await connectChannel(req.businessId!, channel, req.userId!)
  res.json({ connectedChannel })
})

export const disconnect = asyncHandler(async (req: Request, res: Response) => {
  const { channel } = req.body as ChannelActionBody

  if (!channel || !VALID_CHANNELS.includes(channel)) {
    throw new AppError('Canal no válido', 400, 'INVALID_CHANNEL')
  }

  const connectedChannel = await disconnectChannel(req.businessId!, channel, req.userId!)
  res.json({ connectedChannel })
})
