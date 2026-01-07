import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import { pinoMiddleware } from './utils/logger.js';
import { rateLimit } from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import multer from 'multer';



dotenv.config();

const app = express();

const API_VERSION = process.env.API_VERSION || 'v1';
const API_PREFIX = `/api/${API_VERSION}`;

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
})
app.use(limiter);

app.use(cors());
app.use(pinoMiddleware);
app.use(express.json());

// Serve uploaded files statically
app.use(`/${UPLOAD_DIR}`, express.static(UPLOAD_DIR));

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (req, res) => res.json(swaggerSpec));

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);

// Uploads
import uploadRoutes from './routes/upload.routes.js';
app.use(`${API_PREFIX}/uploads`, uploadRoutes);

// Error handler — normalize multer and validation errors
app.use((err, req, res, next) => {
  // Multer-specific errors
  if (err && err.name === 'MulterError') {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    req.log?.warn({ err }, 'Multer error');
    return res.status(status).json({ error: err.message, code: err.code });
  }

  // Errors thrown by validators / custom errors
  if (err && (err.message || err.status)) {
    const status = Number.isInteger(err.status) && err.status >= 400 ? err.status : 400;
    req.log?.warn({ err }, 'Request error');
    return res.status(status).json({ error: err.message || 'Bad Request' });
  }

  // Fallback to 500
  if (err) {
    req.log?.error({ err }, 'Unhandled error');
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  return next();
});

export default app; 
