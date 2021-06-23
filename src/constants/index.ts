export const DEFAULT_REDIS_DB = 0;
export const EVENT_REMINDER_PREFIX = 'reminder';
export const EVENT_NOTIFICATION_CHANNELS = {
  EXPIRED_EVENTS: `__keyevent@${DEFAULT_REDIS_DB}__:expired`,
  SOCKET_BROADCAST: 'socket_broadcast',
};