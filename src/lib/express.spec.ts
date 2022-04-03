import request from 'supertest';
import { app } from '..';

const agent = request.agent(app);

describe('/', () => {
  test('should return available routes with correct api key', async () => {
    const res = await agent.get('/').set('authorization', 'test');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchSnapshot();
  });

  test('should error if given incorrect api key', async () => {
    const res = await agent.get('/').set('authorization', 'wrong');
    expect(res.statusCode).toEqual(401);
    expect(res.body).toMatchSnapshot();
  });

  test('should error if no api key is supplied', async () => {
    const res = await agent.get('/');
    expect(res.statusCode).toEqual(401);
    expect(res.body).toMatchSnapshot();
  });
});
