import request from 'supertest';
import { app } from '../..';

jest.mock('src/utils/decodeSignedMessage');

app.get('/clear-cookies', async (_, res) => {
  res.clearCookie('wallet');
  return res.send();
});

const agent = request.agent(app);

describe('/auth', () => {
  describe('/login', () => {
    test('should handle logging in', async () => {
      const res = await agent
        .post('/auth/login')
        .send({ input: { wallet: 'admin', msg: 'admin-msg' } })
        .expect(200);
      expect(res.body).toMatchSnapshot();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    test('should reject logging in with an incorrect msg', async () => {
      const res = await agent
        .post('/auth/login')
        .send({ input: { wallet: 'admin', msg: 'badMsg' } })
        .expect(401);
      expect(res.body).toMatchSnapshot();
    });
  });

  describe('/', () => {
    test('should handle an incoming cookie and give back the users info', async () => {
      const res = await agent.get('/auth').expect(200);
      expect(res.body).toMatchSnapshot();
    });

    test('should return an anonymous user', async () => {
      await agent.get('/clear-cookies');
      const res = await agent.get('/auth').expect(200);
      expect(res.body).toMatchSnapshot();
    });
  });
});

describe('/auth-check', () => {
  test('should handle checking with a valid wallet', async () => {
    const res = await agent.post('/auth-check').send({
      session_variables: {
        'x-hasura-user-id': 'admin',
        'x-hasura-role': 'admin',
      },
    });
    expect(res.body).toMatchSnapshot();
  });

  test('should handle checking with anonymous', async () => {
    const res = await agent.post('/auth-check').send({
      session_variables: {
        'x-hasura-role': 'anonymous',
      },
    });
    expect(res.body).toMatchSnapshot();
  });
});
