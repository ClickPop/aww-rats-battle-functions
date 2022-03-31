import { decodeSignedMessage } from 'src/utils/decodeSignedMessage';
import { authMiddleware } from 'src/middleware/auth';
import { app } from 'src/lib/express';
import {
  HasuraActionHandler,
  HasuraAuthHook,
  HasuraAuthHookReponseBody,
  HasuraLoginHandler,
  Roles_Enum,
} from 'src/types';
import { sdk } from 'src/lib/graphql';

const { getUserRole, UpsertPlayer } = sdk;

const authHook: HasuraAuthHook = async (_, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
};

const authCheck: HasuraActionHandler<{
  id: string | null;
  role: 'user' | 'admin' | 'anonymous';
}> = async (req, res) => {
  const wallet = req.body.session_variables['x-hasura-user-id'];
  const role = req.body.session_variables['x-hasura-role'];
  const result = {
    id: wallet ?? null,
    role: role,
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
        httpOnly: true,
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
app.post('/auth-check', authCheck);
