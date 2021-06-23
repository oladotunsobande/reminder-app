import * as env from './config/env';
import app from './server.app';
import { logger } from './util/logger';

app.listen(env.APP_PORT, () => {
  logger.info(
    `Event Reminder Service Started successfully on :${env.APP_PORT}\n`,
  );
});
