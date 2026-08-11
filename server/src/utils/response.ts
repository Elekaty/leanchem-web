import type { Response } from 'express'

export interface ApiErrorBody {
  code: string
  message: string
}

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ data, error: null })
}

export function fail(res: Response, code: string, message: string, status = 400) {
  return res.status(status).json({
    data: null,
    error: { code, message } satisfies ApiErrorBody,
  })
}

export class HttpError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status = 400) {
    super(message)
    this.code = code
    this.status = status
  }
}
