import express from 'express';
import swaggerUi from 'swagger-ui-express';
import citizensRouter from './routes/citizens';
import { errorHandler } from './middleware/errorHandler';
import { globalLimiter } from './middleware/rateLimiter';
import openapi from './openapi.json';

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
app.use('/', swaggerUi.serve);
app.get('/', swaggerUi.setup(openapi));
app.get('/openapi.json', (_req, res) => res.json(openapi));
app.use(globalLimiter);

app.use('/v1/citizens', citizensRouter);

app.use(errorHandler);
