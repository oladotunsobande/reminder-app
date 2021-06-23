import appRoot from 'app-root-path';
import { createLogger, format, transports } from 'winston';
import { NODE_ENV } from '../config/env';

export const logger = createLogger({
  transports: [
    new transports.File({
      level: 'info',
      filename: `${appRoot}/logs/combined.log`,
      maxsize: 5242880,
      maxFiles: 5,
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.File({
      level: 'error',
      filename: `${appRoot}/logs/errors.log`,
      handleExceptions: true,
      maxsize: 5242880,
      maxFiles: 5,
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.Console({
      level: 'debug',
      handleExceptions: true,
      silent: !!(NODE_ENV && NODE_ENV.toLowerCase() === 'test'),
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp(),
        format.errors({ stack: true }),
        format.printf(
          (info) => `${info.timestamp} [${info.level}]: ${info.message}`,
        ),
      ),
    }),
  ],
  exitOnError: false,
});
