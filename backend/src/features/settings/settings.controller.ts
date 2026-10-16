import type { Request, Response } from 'express'
import { asyncHandler } from '../../shared/handlers/asyncHandler'
import { AppError } from '../../shared/AppError'
import {
  connectChannel,
  disconnectChannel,
  getBusinessSettings,
  updateBusinessSettings,
  getConnectedChannelsStatus,
  deleteAccount,
} from './settings.service'
import type { ChannelActionBody, UpdateBusinessSettingsBody } from './settings.types'

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

export const getBusiness = asyncHandler(async (req: Request, res: Response) => {
  const business = await getBusinessSettings(req.businessId!)
  res.json({ business })
})

export const updateBusiness = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body as UpdateBusinessSettingsBody
  const business = await updateBusinessSettings(req.businessId!, data, req.userId!)
  res.json({ business })
})

export const getChannelsStatus = asyncHandler(async (req: Request, res: Response) => {
  const channels = await getConnectedChannelsStatus(req.businessId!)
  res.json({ channels })
})

export const deleteAccountHandler = asyncHandler(async (req: Request, res: Response) => {
  await deleteAccount(req.businessId!, req.userId!)
  res.json({ success: true })
})
