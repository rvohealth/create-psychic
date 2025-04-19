import * as winston from 'winston'
import AppEnv from './AppEnv.js'

export default function winstonLogger() {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: AppEnv.boolean('WORKER_SERVICE') ? 'worker' : 'web' },
    // Write to stdout in all environments
    transports: [new winston.transports.Console({ format: winston.format.simple() })],
  })

  if (AppEnv.isDevelopment) {
    //
    // - Write all logs with importance level of `error` or higher to `error.log`
    //   (i.e., error, fatal, but not other levels)
    //
    logger.add(new winston.transports.File({ filename: 'error.log', level: 'error' }))
    //
    // - Write all logs with importance level of `info` or higher to `combined.log`
    //   (i.e., fatal, error, warn, and info, but not trace)
    //
    logger.add(new winston.transports.File({ filename: 'combined.log' }))
  }

  return logger
}
