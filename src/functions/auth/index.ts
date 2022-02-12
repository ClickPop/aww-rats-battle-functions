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

const { getUserRole, UpsertPlayer } = sdk;

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
  try {
    const { wallet, msg } = req.body.input;
    const signer = decodeSignedMessage(msg);
    if (signer && signer === wallet.toLowerCase()) {
      res.cookie('wallet', wallet, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === 'prod',
        sameSite: process.env.NODE_ENV === 'prod' ? 'none' : undefined,
        signed: true,
      });
      const player = await UpsertPlayer({ id: wallet });
      return res.send(player.insert_players_one);
    }
    return res.status(401).send({ error: 'Invalid login' });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

app.post('/auth/login', login);

app.get('/auth', authMiddleware, authHook);
