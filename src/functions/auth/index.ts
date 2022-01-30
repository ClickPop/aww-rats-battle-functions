import { decodeSignedMessage } from '../../utils/decodeSignedMessage';
import { authMiddleware } from '../../middleware/auth';
import { app } from '../../lib/express';
import {
  HasuraAuthHook,
  HasuraAuthHookReponseBody,
  HasuraLoginHandler,
} from 'src/types';

const authHook: HasuraAuthHook = async (_, res) => {
  const wallet = res.locals.auth;
  const result: HasuraAuthHookReponseBody = {
    'X-Hasura-User-Id': wallet,
    'X-Hasura-Role': wallet ? 'user' : 'anonymous',
  };
  return res.json(result);
};

const login: HasuraLoginHandler = async (req, res) => {
  const { wallet, msg } = req.body.input;
  const signer = decodeSignedMessage(msg);
  if (signer && signer === wallet.toLowerCase()) {
    res.cookie('wallet', signer, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'prod',
      signed: true,
    });
    return res.send({ authorized: true });
  }
  return res.status(401).send({ authorized: false });
};

app.post('/auth/login', login);

app.get('/auth', authMiddleware, authHook);
