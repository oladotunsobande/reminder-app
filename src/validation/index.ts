import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ResponseType } from '../types';
import ResponseHandler from '../util/response-handler';

export async function validateSetReminder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<ResponseType> {
  const schema = Joi.object().keys({
    event: Joi.string().max(32).required(),
    date: Joi.date()
      .min('now')
      .required(),
    time: Joi.string()
      .regex(/^([01]\d|2[0-3]):?([0-5]\d)$/)
      .required(),
  });

  const validation = schema.validate(req.body);
  if (validation.error) {
    const error = validation.error.message
      ? validation.error.message
      : validation.error.details[0].message;
    return ResponseHandler.sendErrorResponse({
      res,
      error,
    });
  }

  return next();
}