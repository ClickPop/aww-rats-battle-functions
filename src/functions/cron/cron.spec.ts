import { hasura } from 'src/lib/hasura';
import {
  HasuraEventReqBody,
  HasuraTriggerReqBody,
  Roles_Enum,
} from 'src/types';
import request from 'supertest';
import { app } from '../..';
import { sdk } from 'src/lib/graphql';

const updateRaidSpy = jest.mocked(sdk.updateRaid);
const raidContributionsSpy = jest.mocked(sdk.getRaidContributions);
const raidPayoutSpy = jest.mocked(sdk.handleRaidPayout);

const hasuraPostSpy = jest.spyOn(hasura, 'post');

const agent = request.agent(app);

describe('/cron', () => {
  describe('/reset-energy', () => {
    test('should return cleared token count', async () => {
      const res = await agent
        .post('/cron/reset-energy')
        .set('authorization', 'test');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchSnapshot();
    });

    test('should error if given incorrect api key', async () => {
      const res = await agent
        .post('/cron/reset-energy')
        .set('authorization', 'wrong');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toMatchSnapshot();
    });

    test('should error if no api key is supplied', async () => {
      const res = await agent.post('/cron/reset-energy');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toMatchSnapshot();
    });
  });

  describe('/handle-raid-trigger', () => {
    const defaultBody: HasuraTriggerReqBody = {
      id: 'fake-id',
      event: {
        data: {
          old: null,
          new: null,
        },
        op: 'INSERT',
        session_variables: {
          'x-hasura-user-id': '',
          'x-hasura-role': Roles_Enum.Admin,
        },
      },
      created_at: 'fake-timestamp',
      table: {
        name: 'table',
        schema: 'schema',
      },
      trigger: {
        name: 'trigger',
      },
    };

    afterEach(() => {
      hasuraPostSpy.mockClear();
      updateRaidSpy.mockClear();
    });

    test('should handle INSERT method', async () => {
      const newBody: HasuraTriggerReqBody = {
        ...defaultBody,
        event: {
          ...defaultBody.event,
          op: 'INSERT',
          data: {
            old: null,
            new: { id: 69, active: true, end_timestamp: 'good-timestamp' },
          },
        },
      };

      const res = await agent
        .post('/cron/handle-raid-trigger')
        .set('authorization', 'test')
        .send(newBody);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchSnapshot();
      expect(hasuraPostSpy).toBeCalledTimes(1);
      expect(hasuraPostSpy.mock.calls[0]).toMatchSnapshot();
      expect(hasuraPostSpy).toHaveReturnedTimes(1);
      expect(await hasuraPostSpy.mock.results[0].value).toMatchSnapshot();
      expect(updateRaidSpy).toBeCalledTimes(1);
      expect(updateRaidSpy.mock.calls[0]).toMatchSnapshot();
      expect(updateRaidSpy).toHaveReturnedTimes(1);
      expect(await updateRaidSpy.mock.results[0].value).toMatchSnapshot();
    });

    test('should handle UPDATE method without existing end_event_id but is now active', async () => {
      const newBody: HasuraTriggerReqBody = {
        ...defaultBody,
        event: {
          ...defaultBody.event,
          op: 'UPDATE',
          data: {
            old: { id: 69, active: false, end_timestamp: 'good-timestamp' },
            new: { id: 69, active: true, end_timestamp: 'good-timestamp' },
          },
        },
      };

      const res = await agent
        .post('/cron/handle-raid-trigger')
        .set('authorization', 'test')
        .send(newBody);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchSnapshot();
      expect(hasuraPostSpy).toBeCalledTimes(1);
      expect(hasuraPostSpy.mock.calls[0]).toMatchSnapshot();
      expect(hasuraPostSpy).toHaveReturnedTimes(1);
      expect(await hasuraPostSpy.mock.results[0].value).toMatchSnapshot();
      expect(updateRaidSpy).toBeCalledTimes(1);
      expect(updateRaidSpy.mock.calls[0]).toMatchSnapshot();
      expect(updateRaidSpy).toHaveReturnedTimes(1);
      expect(await updateRaidSpy.mock.results[0].value).toMatchSnapshot();
    });

    test('should handle UPDATE method without existing end_event_id but with a new timestamp', async () => {
      const newBody: HasuraTriggerReqBody = {
        ...defaultBody,
        event: {
          ...defaultBody.event,
          op: 'UPDATE',
          data: {
            old: {
              id: 69,
              active: true,
              end_timestamp: 'good-timestamp-old',
              end_event_id: 'event_id',
            },
            new: {
              id: 69,
              active: true,
              end_timestamp: 'good-timestamp',
              end_event_id: 'event_id',
            },
          },
        },
      };

      const res = await agent
        .post('/cron/handle-raid-trigger')
        .set('authorization', 'test')
        .send(newBody);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchSnapshot();
      expect(hasuraPostSpy).toBeCalledTimes(2);
      expect(hasuraPostSpy.mock.calls[0]).toMatchSnapshot();
      expect(hasuraPostSpy).toHaveReturnedTimes(2);
      expect(await hasuraPostSpy.mock.results[0].value).toMatchSnapshot();
      expect(updateRaidSpy).toBeCalledTimes(2);
      expect(updateRaidSpy.mock.calls[0]).toMatchSnapshot();
      expect(updateRaidSpy).toHaveReturnedTimes(2);
      expect(await updateRaidSpy.mock.results[0].value).toMatchSnapshot();
    });

    test('should handle UPDATE method with existing end_event_id but new timestamp', async () => {
      const newBody: HasuraTriggerReqBody = {
        ...defaultBody,
        event: {
          ...defaultBody.event,
          op: 'UPDATE',
          data: {
            old: {
              id: 69,
              active: true,
              end_timestamp: 'good-timestamp-2',
              end_event_id: 'event-id',
            },
            new: {
              id: 69,
              active: true,
              end_timestamp: 'good-timestamp',
              end_event_id: 'event-id',
            },
          },
        },
      };

      const res = await agent
        .post('/cron/handle-raid-trigger')
        .set('authorization', 'test')
        .send(newBody);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchSnapshot();
      expect(hasuraPostSpy).toBeCalledTimes(2);
      expect(hasuraPostSpy.mock.calls).toMatchSnapshot();
      expect(hasuraPostSpy).toHaveReturnedTimes(2);
      expect(
        await Promise.all(hasuraPostSpy.mock.results.map((r) => r.value)),
      ).toMatchSnapshot();
      expect(updateRaidSpy).toBeCalledTimes(2);
      expect(updateRaidSpy.mock.calls).toMatchSnapshot();
      expect(updateRaidSpy).toHaveReturnedTimes(2);
      expect(
        await Promise.all(updateRaidSpy.mock.results.map((r) => r.value)),
      ).toMatchSnapshot();
    });

    test('should handle UPDATE method with existing end_event_id but is now inactive', async () => {
      const newBody: HasuraTriggerReqBody = {
        ...defaultBody,
        event: {
          ...defaultBody.event,
          op: 'UPDATE',
          data: {
            old: {
              id: 69,
              active: true,
              end_timestamp: 'good-timestamp',
              end_event_id: 'event-id',
            },
            new: {
              id: 69,
              active: false,
              end_timestamp: 'good-timestamp',
              end_event_id: 'event-id',
            },
          },
        },
      };

      const res = await agent
        .post('/cron/handle-raid-trigger')
        .set('authorization', 'test')
        .send(newBody);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchSnapshot();
      expect(hasuraPostSpy).toBeCalledTimes(1);
      expect(hasuraPostSpy.mock.calls).toMatchSnapshot();
      expect(hasuraPostSpy).toHaveReturnedTimes(1);
      expect(
        await Promise.all(hasuraPostSpy.mock.results.map((r) => r.value)),
      ).toMatchSnapshot();
      expect(updateRaidSpy).toBeCalledTimes(1);
      expect(updateRaidSpy.mock.calls).toMatchSnapshot();
      expect(updateRaidSpy).toHaveReturnedTimes(1);
      expect(
        await Promise.all(updateRaidSpy.mock.results.map((r) => r.value)),
      ).toMatchSnapshot();
    });

    test('should handle DELETE method with existing end_event_id', async () => {
      const newBody: HasuraTriggerReqBody = {
        ...defaultBody,
        event: {
          ...defaultBody.event,
          op: 'DELETE',
          data: {
            old: {
              id: 69,
              end_event_id: 'event-id',
            },
            new: null,
          },
        },
      };

      const res = await agent
        .post('/cron/handle-raid-trigger')
        .set('authorization', 'test')
        .send(newBody);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchSnapshot();
      expect(hasuraPostSpy).toBeCalledTimes(1);
      expect(hasuraPostSpy.mock.calls).toMatchSnapshot();
      expect(hasuraPostSpy).toHaveReturnedTimes(1);
      expect(
        await Promise.all(hasuraPostSpy.mock.results.map((r) => r.value)),
      ).toMatchSnapshot();
      expect(updateRaidSpy).toBeCalledTimes(1);
      expect(updateRaidSpy.mock.calls).toMatchSnapshot();
      expect(updateRaidSpy).toHaveReturnedTimes(1);
      expect(
        await Promise.all(updateRaidSpy.mock.results.map((r) => r.value)),
      ).toMatchSnapshot();
    });

    test('should error if given incorrect api key', async () => {
      const res = await agent
        .post('/cron/handle-raid-trigger')
        .set('authorization', 'wrong')
        .send(defaultBody);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toMatchSnapshot();
    });

    test('should error if no api key is supplied', async () => {
      const res = await agent
        .post('/cron/handle-raid-trigger')
        .send(defaultBody);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toMatchSnapshot();
    });
  });

  describe('/handle-raid-end', () => {
    const defaultBody: HasuraEventReqBody = {
      id: 'fake-id',
      created_at: 'fake-timestamp',
      scheduled_time: 'fake-timestamp',
      payload: {
        raid_id: 69,
      },
    };

    afterEach(() => {
      raidContributionsSpy.mockClear();
      raidPayoutSpy.mockClear();
    });

    test('should handle a community raid end', async () => {
      const res = await agent
        .post('/cron/handle-raid-end')
        .set('authorization', 'test')
        .send(defaultBody);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchSnapshot();
      expect(raidContributionsSpy).toBeCalledTimes(1);
      expect(raidContributionsSpy.mock.calls).toMatchSnapshot();
      expect(raidContributionsSpy).toHaveReturnedTimes(1);
      expect(
        await Promise.all(
          raidContributionsSpy.mock.results.map((r) => r.value),
        ),
      ).toMatchSnapshot();
      expect(raidPayoutSpy).toBeCalledTimes(1);
      expect(raidPayoutSpy.mock.calls).toMatchSnapshot();
      expect(raidPayoutSpy).toHaveReturnedTimes(1);
      expect(
        await Promise.all(raidPayoutSpy.mock.results.map((r) => r.value)),
      ).toMatchSnapshot();
    });

    test('should handle a faction raid end', async () => {
      const res = await agent
        .post('/cron/handle-raid-end')
        .set('authorization', 'test')
        .send({ ...defaultBody, payload: { raid_id: 70 } });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchSnapshot();
      expect(raidContributionsSpy).toBeCalledTimes(1);
      expect(raidContributionsSpy.mock.calls).toMatchSnapshot();
      expect(raidContributionsSpy).toHaveReturnedTimes(1);
      expect(
        await Promise.all(
          raidContributionsSpy.mock.results.map((r) => r.value),
        ),
      ).toMatchSnapshot();
      expect(raidPayoutSpy).toBeCalledTimes(1);
      expect(raidPayoutSpy.mock.calls).toMatchSnapshot();
      expect(raidPayoutSpy).toHaveReturnedTimes(1);
      expect(
        await Promise.all(raidPayoutSpy.mock.results.map((r) => r.value)),
      ).toMatchSnapshot();
    });

    test('should error with an incorrect encounter type', async () => {
      const res = await agent
        .post('/cron/handle-raid-end')
        .set('authorization', 'test')
        .send({ ...defaultBody, payload: { raid_id: 68 } });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toMatchSnapshot();
      expect(raidContributionsSpy).toBeCalledTimes(1);
      expect(raidContributionsSpy.mock.calls).toMatchSnapshot();
      expect(raidContributionsSpy).toHaveReturnedTimes(1);
      expect(
        await Promise.all(
          raidContributionsSpy.mock.results.map((r) => r.value),
        ),
      ).toMatchSnapshot();
    });

    test('should error if the raid is not found', async () => {
      const res = await agent
        .post('/cron/handle-raid-end')
        .set('authorization', 'test')
        .send({ ...defaultBody, payload: { raid_id: 71 } });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toMatchSnapshot();
      expect(raidContributionsSpy).toBeCalledTimes(1);
      expect(raidContributionsSpy.mock.calls).toMatchSnapshot();
      expect(raidContributionsSpy).toHaveReturnedTimes(1);
      expect(
        await Promise.all(
          raidContributionsSpy.mock.results.map((r) => r.value),
        ),
      ).toMatchSnapshot();
    });

    test('should error if missing raid_id in request body', async () => {
      const res = await agent
        .post('/cron/handle-raid-end')
        .set('authorization', 'test')
        .send({ ...defaultBody, payload: { raid_id: undefined } });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toMatchSnapshot();
      expect(raidContributionsSpy).toBeCalledTimes(0);
    });

    test('should error if given incorrect api key', async () => {
      const res = await agent
        .post('/cron/handle-raid-end')
        .set('authorization', 'wrong')
        .send(defaultBody);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toMatchSnapshot();
    });

    test('should error if no api key is supplied', async () => {
      const res = await agent.post('/cron/handle-raid-end').send(defaultBody);
      expect(res.statusCode).toEqual(401);
      expect(res.body).toMatchSnapshot();
    });
  });
});
