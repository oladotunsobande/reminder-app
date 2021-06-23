import randomstring from 'randomstring';
import { EVENT_NOTIFICATION_CHANNELS, EVENT_REMINDER_PREFIX } from '../constants';
import Subscriber from '../services/Subscriber';
import ReminderService from '../services/ReminderService';

function getEventExpiry(date: string, time: string): number {
  const dateObject: any = new Date(date);

  const day = dateObject.getDate();
  const month = dateObject.getMonth();
  const year = dateObject.getFullYear();
  const [hour, minute] = time.split(':');

  const eventDate: number = new Date(day, month, year, parseInt(hour), parseInt(minute)).getTime();
  const currentDate: number = new Date().getTime();

  return eventDate - currentDate;
}

function getRedisKey(): string {
  return randomstring.generate({
    charset: 'alphanumeric',
    length: 32,
  });
}

export function setReminderDetails(event: string, date: string, time: string): any {
  const key: string = getRedisKey();
  const value: string = JSON.stringify({ event, date, time });
  const expiry: number = getEventExpiry(date, time);

  return {
    key,
    value,
    expiry,
  };
}

export async function subscribeToReminderEvents() : Promise<void> {
  Subscriber.subscribe(EVENT_NOTIFICATION_CHANNELS.EXPIRED_EVENTS);

  Subscriber.on("message", async (channel: string, message: string) => {
    if (channel === EVENT_NOTIFICATION_CHANNELS.EXPIRED_EVENTS) {
      const [prefix, key] = message.split(':');

      if (prefix === EVENT_REMINDER_PREFIX) {
        const reminderService = new ReminderService();

        const payload: string = await reminderService.getEvent(message);
        notifyClients(payload);
      }
    }
  });
}

export function notifyClients(payload: string): void {
  Subscriber.publish(EVENT_NOTIFICATION_CHANNELS.SOCKET_BROADCAST, payload);
}