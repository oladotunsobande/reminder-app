import Joi from 'joi';

export function validatePayload(payload: any): {
  status: boolean;
  error?: string;
} {
  const schema = Joi.object().keys({
    id: Joi.string().max(24).required(),
    event: Joi.string().max(32).required(),
    date: Joi.date()
      .min(new Date().toDateString())
      .required(),
    time: Joi.string()
      .regex(/^([01]\d|2[0-3]):?([0-5]\d)$/)
      .required(),
  });

  const validation = schema.validate(payload);
  if (validation.error) {
    const error = validation.error.message
      ? validation.error.message
      : validation.error.details[0].message;
    
    return { status: false, error };
  }

  return { status: true };
}