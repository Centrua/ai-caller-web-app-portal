import { Response } from 'express'

export function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ success: false, error: message })
}

export function sendSuccess<T>(res: Response, status: number, data: T): void {
  res.status(status).json({ success: true, data })
}
