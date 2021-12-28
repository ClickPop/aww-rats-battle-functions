import cookieParser from 'cookie-parser';
import express from 'express';
import morgan from 'morgan';
import { COOKIE_SECRET } from '../config/env';

const a = express();

a.use(express.json());
a.use(cookieParser(COOKIE_SECRET));

if (process.env.NODE_ENV !== 'production') {
  a.use(morgan('dev'));
}

export const app = a;
