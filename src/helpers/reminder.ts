import redis from 'redis';
import randomstring from 'randomstring';
import * as env from '../config/env';

const pub = redis.createClient({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
});

export function formatHourOrMinute(value: string, addZeros: boolean = false): number {
  if (value.length == 2 && value.startsWith('0') && !addZeros) {
    return parseInt(value[1]);
  } else if (value.length == 1 && addZeros) {
    return parseInt(`0${value[0]}`);
  }

  return parseInt(value);
}

export function generateUniqueId() {
 return randomstring.generate({
   charset: 'alphanumeric',
   length: 20,
 });
}

export function getEventExpiry(date: string, time: string): number {
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