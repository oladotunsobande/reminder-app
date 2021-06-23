import redis from 'redis';
import * as env from '../config/env';
import { DEFAULT_REDIS_DB } from '../constants';

class ReminderService {
  private client: redis.RedisClient;

  constructor() {
    this.client = redis.createClient({
      host: env.REDIS_HOST,
      port: parseInt(env.REDIS_PORT),
      db: DEFAULT_REDIS_DB,
    });

    this.client.on('ready', () => {
      this.client.config("SET", "notify-keyspace-events", "Ex");
    });
  }
}

export default ReminderService;