import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const globalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.global.windowMs,
  max: config.RATE_LIMIT.global.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    obj: { error: 'Too many requests. Try again later.', code: 'RATE_LIMITED' },
  },
});

export const strictLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.strict.windowMs,
  max: config.RATE_LIMIT.strict.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    obj: { error: 'Too many requests. Try again later.', code: 'RATE_LIMITED' },
  },
});
