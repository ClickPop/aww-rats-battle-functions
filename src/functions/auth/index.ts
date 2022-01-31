import { decodeSignedMessage } from '../../utils/decodeSignedMessage';
import { authMiddleware } from '../../middleware/auth';
import { app } from '../../lib/express';
import {
  HasuraAuthHook,
  HasuraAuthHookReponseBody,
  HasuraLoginHandler,
  Roles_Enum,
} from '../../types';
import { sdk } from '../../lib/graphql';

const { getUserRole } = sdk;

const authHook: HasuraAuthHook = async (_, res) => {
  const wallet = res.locals.auth;
  let role: Roles_Enum = Roles_Enum.Anonymous;
  if (wallet) {
    const resp = await getUserRole({ wallet });
    const userRole = resp.users_roles_by_pk?.role;
    role = userRole ? userRole : Roles_Enum.User;
  }
  const result: HasuraAuthHookReponseBody = {
    'X-Hasura-User-Id': wallet,
    'X-Hasura-Role': role,
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
