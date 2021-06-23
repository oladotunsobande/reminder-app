import { Request, Response, NextFunction } from 'express';
import { ResponseType } from '../types';
import ResponseHandler from '../util/response-handler';
import ReminderService from '../services/ReminderService';

export async function setReminder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<ResponseType> {
  const { event, date, time } = req.body;

  try {
    const reminderService = new ReminderService();
    await reminderService.setReminder(event, date, time);

    return ResponseHandler.sendSuccessResponse({
      res,
      message: 'Event reminder created successfully',
    });
  } catch (error) {
    return next(error);
  }
}