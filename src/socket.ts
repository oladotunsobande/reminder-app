import Socket from './socket.app';
import * as env from './config/env';
import { logger } from './util/logger';

const socket = new Socket(env.SOCKET_PORT);

socket.startRedisSubscriber();
socket.startSocketServer();

logger.info(`Reminder Notification Server running on :${env.SOCKET_PORT}\n`);