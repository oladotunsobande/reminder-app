import { Response } from 'express';

export type ResponseType = Response | void;

export type DefaultResponseType = {
  status: boolean;
  data?: any;
  error?: string;
};