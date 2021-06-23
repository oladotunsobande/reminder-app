import redis from 'redis';
import * as env from '../config/env';

const publisher = redis.createClient({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
});

const subscriber = redis.createClient({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
});
subscriber.setMaxListeners(0);

class Subscriber {
  publish (channel: string, message: string) {
    publisher.publish(channel, message);
  } 
  
  subscribe (channel: string) {
    subscriber.subscribe(channel);
  }  
  
  on (event: string, callback: (channel: string, message: string) => void) {
    subscriber.on(event, (channel: string, message: string) => {
      callback(channel, message);
    });
  }
}

export default new Subscriber();