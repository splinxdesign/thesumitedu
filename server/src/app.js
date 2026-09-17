import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { ApiError, notFound, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  // Render/Railway/Heroku sit behind a proxy; express-rate-limit needs the real IP.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        // No Origin header: curl, server-to-server, same-origin production build.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new ApiError(403, `Origin ${origin} is not allowed by CORS`));
      },
    }),
  );

  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
