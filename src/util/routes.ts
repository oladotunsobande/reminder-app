import express from 'express';
import reminder from '../routes';

const routes = (app: express.Application): void => {
  app.use('/v1/reminder', reminder);
};

export default routes;
