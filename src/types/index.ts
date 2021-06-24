export type ValidationResponseType = {
  status: boolean;
  error?: string;
};

export type EventReminderPayloadType = {
  id: string;
  event: string;
  date: string;
  time: string;
};