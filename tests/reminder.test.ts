import expect from 'expect';
import { SOCKET_PORT } from '../src/config/env';
import { io, Socket } from 'socket.io-client';
import SocketApp from '../src/socket.app';
import { formatHourOrMinute, generateUniqueId } from '../src/helpers/reminder';

const socket = new SocketApp(SOCKET_PORT);

const options: any = {
  rememberUpgrade: true,
  transports: ['polling'],
  secure: false, 
  rejectUnauthorized: false,
};
const clientURL: string = `http://localhost:${SOCKET_PORT}`;

let channelId: string;

describe('Event Reminder', () => {
  let clientSocket: Socket;

  before(() => {
    socket.startRedisSubscriber();
    socket.startSocketServer();
  });

  after(() => {
    socket.close();
    clientSocket.close();
  });

  beforeEach(() => {
    clientSocket = io(clientURL, options);
    clientSocket.on('connect', () => {});
  });

  afterEach(() => {
    clientSocket.disconnect();
  });

  it('should fail when event channel is empty string', (done) => {
    clientSocket.emit('reminder:event-subscription', '');

    clientSocket.on('reminder:error', (message: string) => {
      expect(message).toBe('Event channel must be a valid string');
      done();
    });
  });

  it('should fail if channel id is undefined', (done) => {
    const payload: any = {
      id: undefined,
      event: 'Independence Day',
      date: '2021-07-04',
      time: '00:00',
    };

    clientSocket.emit('reminder:new-event', JSON.stringify(payload));

    clientSocket.on('reminder:error', (message: string) => {
      expect(message).toBe("\"id\" is required");
      done();
    });
  });

  it('should fail when event channel does not exist', (done) => {
    const channel: string = generateUniqueId();

    clientSocket.emit('reminder:event-subscription', channel);

    clientSocket.on('reminder:error', (message: string) => {
      expect(message).toBe(`Event (${channel}) does not exist`);
      done();
    });
  });

  it('should fail if event is undefined', (done) => {
    const payload: any = {
      id: generateUniqueId(),
      event: undefined,
      date: '2021-07-04',
      time: '00:00',
    };

    clientSocket.emit('reminder:new-event', JSON.stringify(payload));

    clientSocket.on('reminder:error', (message: string) => {
      expect(message).toBe("\"event\" is required");
      done();
    });
  });

  it('should fail if date is undefined', (done) => {
    const payload: any = {
      id: generateUniqueId(),
      event: 'Independence Day',
      date: undefined,
      time: '00:00',
    };

    clientSocket.emit('reminder:new-event', JSON.stringify(payload));

    clientSocket.on('reminder:error', (message: string) => {
      expect(message).toBe("\"date\" is required");
      done();
    });
  });

  it('should fail if time is undefined', (done) => {
    const payload: any = {
      id: generateUniqueId(),
      event: 'Independence Day',
      date: '2021-07-04',
      time: undefined,
    };

    clientSocket.emit('reminder:new-event', JSON.stringify(payload));

    clientSocket.on('reminder:error', (message: string) => {
      expect(message).toBe("\"time\" is required");
      done();
    });
  });

  it('should fail if time is in the past', (done) => {
    const dateObject: any = new Date();

    const payload: any = {
      id: generateUniqueId(),
      event: 'Special Anniversary',
      date: dateObject.toDateString(),
      time: `${dateObject.getHours() - 2}:${dateObject.getMinutes()}`,
    };

    clientSocket.emit('reminder:new-event', JSON.stringify(payload));

    clientSocket.on('reminder:error', (message: string) => {
      expect(message).toBe("\"time\" must be greater than or equal to current time");
      done();
    });
  });

  it('should fail if date is invalid', (done) => {
    const payload: any = {
      id: generateUniqueId(),
      event: 'Independence Day',
      date: '2021-17-04',
      time: '00:00',
    };

    clientSocket.emit('reminder:new-event', JSON.stringify(payload));

    clientSocket.on('reminder:error', (message: string) => {
      expect(message).toBe("\"date\" must be a valid date");
      done();
    });
  });

  it('should fail if time is invalid', (done) => {
    const payload: any = {
      id: generateUniqueId(),
      event: 'Independence Day',
      date: '2021-07-04',
      time: '27:00',
    };

    clientSocket.emit('reminder:new-event', JSON.stringify(payload));

    clientSocket.on('reminder:error', (message: string) => {
      expect(message.startsWith(`\"time\" with value \"${payload.time}\" fails to match the required pattern`)).toBe(true);
      done();
    });
  });

  it('should fail if date is in the past', (done) => {
    const payload: any = {
      id: generateUniqueId(),
      event: 'Independence Day',
      date: '2021-06-04',
      time: '00:00',
    };

    clientSocket.emit('reminder:new-event', JSON.stringify(payload));

    clientSocket.on('reminder:error', (message: string) => {
      expect(message.startsWith("\"date\" must be greater than or equal to")).toBe(true);
      done();
    });
  });

  it('should create event reminder', (done) => {
    channelId = generateUniqueId();

    const payload: any = {
      id: channelId,
      event: 'Birthday Celebration',
      date: '2023-12-21',
      time: '00:00',
    };

    clientSocket.emit('reminder:new-event', JSON.stringify(payload));

    clientSocket.on('reminder:event-creation', (message: string) => {
      expect(message).toBe('Event channel created successfully');
      done();
    });
  });

  it('should fail if channel exists', (done) => {
    const payload: any = {
      id: channelId,
      event: 'Birthday Celebration',
      date: '2023-12-21',
      time: '00:00',
    };

    clientSocket.emit('reminder:new-event', JSON.stringify(payload));

    clientSocket.on('reminder:error', (message: string) => {
      expect(message).toBe(`Event channel (${payload.id}) already exists`);
      done();
    });
  });

  it('should receive event reminder notification', (done) => {
    const clientSocket2 = io(clientURL, options);
    clientSocket2.on('connect', () => {});

    const newChannelId: string = generateUniqueId();

    const payload: any = {
      id: newChannelId,
      event: 'Wedding Anniversary',
      date: new Date().toDateString(),
      time: `${formatHourOrMinute(String(new Date().getHours()))}:${formatHourOrMinute(String(new Date().getMinutes() + 1))}`,
    };

    clientSocket.emit('reminder:new-event', JSON.stringify(payload));

    clientSocket2.emit('reminder:event-subscription', newChannelId);

    clientSocket2.on('reminder:event-notification', (message: string) => {
      expect(message.startsWith('[EVENT REMINDER NOTIFICATION]')).toBe(true);

      clientSocket2.disconnect();
      done();
    });
  });  
});