import express from 'express';
import citizensRouter from './routes/citizens';
import { errorHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';

export const app = express();

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());
app.use(globalLimiter);

app.get('/', (_req, res) => {
  res.json({
    service: 'Nida Mock API',
    version: 'v1',
    endpoint: 'GET/POST /v1/citizens',
    status: 'running',
  });
});

app.use('/v1/citizens', citizensRouter);

app.use(errorHandler);
