import cookieParser from 'cookie-parser';
import express from 'express';
import morgan from 'morgan';
import { checkApiKey } from '../middleware/checkApiKey';
import { COOKIE_SECRET } from '../config/env';

const a = express();
a.use(
  express.json({
    limit: '1mb',
  }),
);
a.use(cookieParser(COOKIE_SECRET));

if (process.env.NODE_ENV !== 'production') {
  a.use(morgan('dev'));
}

a.get('/', checkApiKey, (_, res) => {
  const routes = a._router.stack
    .filter((s: any) => s?.route?.path && s.route.path !== '/')
    .map((s: any) => ({
      path: s.route.path,
      methods: Object.keys(s.route.methods),
    }));
  return res.json(routes);
});

export const app = a;
