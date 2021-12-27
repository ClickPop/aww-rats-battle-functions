import express from 'express';
import cookieParser from 'cookie-parser';
import { COOKIE_SECRET, PORT } from './config/env';
import { auth } from './functions/auth';
import { encounters } from './functions/encounters';
import { gauntlets } from './functions/gauntlets';
import { raids } from './functions/raids';
import morgan from 'morgan';

const app = express();

app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));
app.use(morgan('dev'));

app.use('/auth', auth);
app.use('/encounters', encounters);
app.use('/gauntlets', gauntlets);
app.use('/raids', raids);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
