import { RedisClient } from 'redis';
import { logger } from '../util/logger';
import { redisClient, redisAsync } from '../util/redis';
import { EVENT_REMINDER_PREFIX } from '../constants';
import * as ReminderHelper from '../helpers/reminder';

class ReminderService {
  private redis: any;
  private client: RedisClient;

  constructor() {
    this.redis = redisAsync;
    this.client = redisClient;

    this.client.on('ready', () => {
      logger.info('Redis connection is READY');
      this.client.config("SET", "notify-keyspace-events", "Ex");
    });
  }

  async getEvent (key: string) {
    return this.redis.get(key);
  }

  async setReminder (event: string, date: string, time: string) {
    const { key, value, expiry } = ReminderHelper.setReminderDetails(event, date, time);
    return this.redis.set(
      `${EVENT_REMINDER_PREFIX}:${key}`, 
      value, 
      'EX', 
      expiry,
    );
  }
}

export default ReminderService;