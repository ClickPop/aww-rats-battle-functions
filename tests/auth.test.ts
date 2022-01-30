import request from 'supertest';
import { app } from '../src/index';

app.get('/clear-cookies', async (_, res) => {
  res.clearCookie('wallet');
  return res.send();
});

const agent = request.agent(app);

const dummyWallet = '0xFa66D9E03ADd9dC77D37f5aB23e3dEF7E40A81F8';
const dummyMsg =
  '0x3eedff834cc55d5a859ae790cc7acd8e0d00a4a858d5f9b14883f13fb12cff653542c544a3d9cac4973fa46a8b74ca9683e776e7166c55b9cade8a0bb2109cdd1c';

describe('/auth', () => {
  describe('/login', () => {
    test('should handle logging in', async () => {
      const res = await agent
        .post('/auth/login')
        .send({ input: { wallet: dummyWallet, msg: dummyMsg } })
        .expect(200);
      expect(res.body.authorized).toBe(true);
      expect(res.headers['set-cookie']).toBeDefined();
    });

    test('should reject logging in with an', async () => {
      const res = await agent
        .post('/auth/login')
        .send({ input: { wallet: dummyWallet, msg: dummyMsg + '1' } })
        .expect(401);
      expect(res.body.authorized).toBe(false);
    });
  });

  describe('/', () => {
    test('should handle an incoming cookie and give back the users info', async () => {
      const res = await agent.get('/auth').expect(200);
      expect(res.body['X-Hasura-User-Id']).toEqual(dummyWallet.toLowerCase());
      expect(res.body['X-Hasura-Role']).toEqual('user');
    });

    test('should return an anonymous user', async () => {
      await agent.get('/clear-cookies');
      const res = await agent.get('/auth').expect(200);
      expect(res.body['X-Hasura-User-Id']).toBeUndefined();
      expect(res.body['X-Hasura-Role']).toEqual('anonymous');
    });
  });
});
