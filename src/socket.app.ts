import redis from 'redis';
import * as env from './config/env';
import { redisAsync } from './util/redis';
import { DEFAULT_REDIS_DB, EVENT_NOTIFICATION_CHANNEL } from './constants';

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

  private broadcast(orderId: string, message: string) {
    this.io.in(orderId).emit('kds-update', message);
  }

  startRedisSubscriber() {
    this.sub.on('message',  (channel: string, message: string) => {
      const payload = JSON.parse(message);
      this.broadcast(payload.orderId, JSON.stringify(payload));
    });
    
    this.sub.subscribe(EVENT_NOTIFICATION_CHANNEL);
  }

  startSocketServer() {
    this.io.on('connection', (socket: any) => {
      this.subscribe(socket);
    
      socket.on('kds:order', async (data: string) => {
      
      });
    
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