import fs from 'fs';
import path from 'path';
import pino from 'pino';
import pinoHttp from 'pino-http';

const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_FILE = process.env.LOG_FILE || 'app.log';

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const logPath = path.join(LOG_DIR, LOG_FILE);
const destination = pino.destination(logPath);

const logger = pino({ level: process.env.LOG_LEVEL || 'info' }, destination);

const pinoMiddleware = pinoHttp({ logger });

export { logger, pinoMiddleware };