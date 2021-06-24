import redis from 'redis';
import * as env from '../config/env';

const pub = redis.createClient({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
});

function formatHourOrMinute(value: string): number {
  if (value.length == 2 && value.startsWith('0')) {
    return parseInt(value[1]);
  }

  return parseInt(value);
}

function getEventExpiry(date: string, time: string): number {
  const dateObject: any = new Date(date);

  const day = dateObject.getDate();
  const month = dateObject.getMonth();
  const year = dateObject.getFullYear();
  let [hour, minute] = time.split(':');

  const eventDate: number = new Date(year, month, day, formatHourOrMinute(hour), formatHourOrMinute(minute)).getTime();
  const currentDate: number = new Date().getTime();
  const diff: number = eventDate - currentDate;

  return Math.ceil(diff / 1000);
}

export function setReminderDetails(event: string, date: string, time: string): any {
  const value: string = JSON.stringify({ event: event.toLowerCase(), date, time });
  const expiry: number = getEventExpiry(date, time);

  return {
    value,
    expiry,
  };
}