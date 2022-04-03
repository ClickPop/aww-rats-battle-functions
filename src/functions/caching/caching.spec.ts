import request from 'supertest';
import { app } from '../..';

const agent = request.agent(app);

describe('/caching/clear', () => {
  test('should return cleared token count', async () => {
    const res = await agent.post('/caching/clear').set('authorization', 'test');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchSnapshot();
  });

  test('should error if given incorrect api key', async () => {
    const res = await agent
      .post('/caching/clear')
      .set('authorization', 'wrong');
    expect(res.statusCode).toEqual(401);
    expect(res.body).toMatchSnapshot();
  });

  test('should error if no api key is supplied', async () => {
    const res = await agent.post('/caching/clear');
    expect(res.statusCode).toEqual(401);
    expect(res.body).toMatchSnapshot();
  });
});
