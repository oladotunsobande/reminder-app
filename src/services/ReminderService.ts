import { RedisClient } from 'redis';
import { logger } from '../util/logger';
import { redisClient } from '../util/redis';
import { EVENT_REMINDER_PREFIX } from '../constants';
import * as ReminderHelper from '../helpers/reminder';
import { EventReminderPayloadType } from '../types';

class ReminderService {
  private client: RedisClient;

  constructor() {
    this.client = redisClient;
    
    this.client.on('ready', () => {
      logger.info('Redis connection is READY');
      this.client.config("SET", "notify-keyspace-events", "Ex");
    });
  }

  async setReminder ({id, event, date, time }: EventReminderPayloadType) {
    const { value, expiry } = ReminderHelper.setReminderDetails(event, date, time);
    return this.client
      .multi()
      .set(id, value)
      .set(`${EVENT_REMINDER_PREFIX}:${id}`, event)
      .expire(`${EVENT_REMINDER_PREFIX}:${id}`, expiry)
      .exec();
  }
}

export default ReminderService;