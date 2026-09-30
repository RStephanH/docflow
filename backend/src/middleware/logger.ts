import { Request, Response, NextFunction } from 'express'
import logger from '../config/logger'
import { v4 as uuidv4 } from 'uuid'

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = uuidv4()
  const start = Date.now()

  // Attach the requestId to the request for traceability
  req.requestId = requestId

  res.on('finish', () => {
    logger.info('request', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip,
    })
  })

  next()
}
