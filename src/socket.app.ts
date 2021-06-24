import redis from 'redis';
import * as env from './config/env';
import { logger } from './util/logger';
import { 
  DEFAULT_REDIS_DB, 
  EVENT_REMINDER_PREFIX,
  EVENT_NOTIFICATION_CHANNELS,
} from './constants';
import { redisAsync } from './util/redis';
import { validatePayload } from './validation';
import { ValidationResponseType, EventReminderPayloadType } from './types';
import ReminderService from './services/ReminderService';

class Socket {
  private io: any;
  private sub: redis.RedisClient;

  constructor(port: string) {
    this.io = require('socket.io')(port, {
      transports: ['polling','websockets'],
      cors: { origin: "*" },
    });

    this.sub = redis.createClient({
      host: env.REDIS_HOST,
      port: parseInt(env.REDIS_PORT),
      db: DEFAULT_REDIS_DB,
    });
    this.sub.setMaxListeners(0);
  }

  private async addNewEventReminder(socket: any, payload: EventReminderPayloadType) {
    const validationResponse: ValidationResponseType = validatePayload(payload);
    if (!validationResponse.status) {
      this.io.to(socket.id).emit('reminder:error', validationResponse.error!);
      socket.disconnect(true);
  
      return;
    }

    const reminderService = new ReminderService();
    await reminderService.setReminder({ ...payload });
    logger.info(`Event reminder created for ${payload.event}`);
  }

  private async subscribe(socket: any) {
    const eventKey: string = socket.handshake.query.key;
    if (eventKey) {
      const data: string | null = await redisAsync.get(eventKey);
      if (!data) {
        this.io.to(socket.id).emit('reminder:error', `Event (${eventKey}) does not exist`);
        socket.disconnect(true);

        return;
      }

      socket.join(eventKey);
      logger.info(`Client added to event channel, ${eventKey}`);
    } else {
      logger.info('Connected to socket server');
    }
  }

  private broadcast(event: string, message: string) {
    this.io.in(event).emit('reminder:event-notification', message);
    logger.info(`[ ${event} ] - Notifications sent!`)
  }

  startRedisSubscriber() {
    this.sub.on('message',  async (channel: string, message: string) => {
      if (channel === EVENT_NOTIFICATION_CHANNELS.EXPIRED_EVENTS) {
        const [prefix, key] = message.split(':');
  
        if (prefix === EVENT_REMINDER_PREFIX) {
          const payload: string | null = await redisAsync.get(key);
          if (payload) {
            const { event, date, time } = JSON.parse(payload);
            this.broadcast(key, `[EVENT REMINDER NOTIFICATION] - Event: ${event}, Date: ${date}, Time: ${time}`);
            
            await redisAsync.del(key);
          }
        }
      }
    });
    
    this.sub.subscribe(EVENT_NOTIFICATION_CHANNELS.EXPIRED_EVENTS);
  }

  startSocketServer() {
    this.io.on('connection', (socket: any) => {
      this.subscribe(socket);

      socket.on('reminder:new-event', async (message: string) => {
        await this.addNewEventReminder(socket, JSON.parse(message));   
      });
    
      socket.on('disconnect', async () => {
        socket.disconnect(true);
        logger.info('Client disconnected');
      });
    
      socket.on('error', async () => {
        socket.disconnect(true);
        logger.info('Client disconnected');
      });
    });
  }
}

export default Socket;