import redis from 'redis';
import * as env from './config/env';
import { DEFAULT_REDIS_DB, EVENT_NOTIFICATION_CHANNELS } from './constants';

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

  private async subscribe(socket: any) {
    const event: string = socket.handshake.query.eventName;
    socket.join(event);
  }

  private broadcast(event: string, message: string) {
    this.io.in(event).emit('reminder:event-notification', message);
  }

  startRedisSubscriber() {
    this.sub.on('message',  (channel: string, message: string) => {
      if (channel === EVENT_NOTIFICATION_CHANNELS.SOCKET_BROADCAST) {
        const { event, date, time } = JSON.parse(message);
        this.broadcast(event, `[EVENT REMINDER NOTIFICATION] - Event: ${event}, Date: ${date}, Time: ${time}`);
      }
    });
    
    this.sub.subscribe(EVENT_NOTIFICATION_CHANNELS.SOCKET_BROADCAST);
  }

  startSocketServer() {
    this.io.on('connection', (socket: any) => {
      this.subscribe(socket);
    
      socket.on('disconnect', async () => {
        socket.disconnect(true);
      });
    
      socket.on('error', async () => {
        socket.disconnect(true);
      });
    });
  }
}

export default Socket;