import { decodeSignedMessage } from '../utils/decodeSignedMessage';
import express from 'express';
import { authMiddleware } from '../middleware/auth';

const app = express();

app.post('/login', async (req, res) => {
  console.log(req.body);
  const { wallet, msg } = req.body;
  const signer = decodeSignedMessage(msg);
  if (signer && signer === wallet.toLowerCase()) {
    res.cookie('wallet', signer, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'prod',
      signed: true,
    });
    return res.send({ status: 'authorized' });
  }
  return res.status(401).send({ status: 'unauthorized' });
});

app.get('/', authMiddleware, async (_, res) => {
  const wallet = res.locals.auth;
  const result = {
    'X-Hasura-User-Id': wallet,
    'X-Hasura-Role': wallet ? 'user' : 'anonymous',
  };
  return res.json(result);
});

export const auth = app;
