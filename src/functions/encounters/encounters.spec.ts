import request from 'supertest';
import { app } from '../..';
import { sdk } from 'src/lib/graphql';

jest.mock('src/utils/decodeSignedMessage');

const getPlayerSpy = jest.mocked(sdk.getPlayerById);
const getEncounterSpy = jest.mocked(sdk.getEncounterById);
const getRaidSpy = jest.mocked(sdk.getRaidbyId);
const getRatsSpy = jest.mocked(sdk.getRatsByIds);
const addSoloSpy = jest.mocked(sdk.addSoloEncounterAttempt);
const addContributionSpy = jest.mocked(sdk.addRaidContribution);

const agent = request.agent(app);

describe('/solo-encounter-attempt', () => {
  afterEach(() => {
    getPlayerSpy.mockClear();
    getEncounterSpy.mockClear();
    getRatsSpy.mockClear();
    addSoloSpy.mockClear();
  });

  test('should add attempt with required data', async () => {
    const res = await agent
      .post('/solo-encounter-attempt')
      .send({
        session_variables: {
          'x-hasura-user-id': 'admin',
          'x-hasura-user-role': 'admin',
        },
        input: {
          encounter_id: 69,
          rat_ids: ['69'],
        },
      })
      .expect(200);
    expect(res.body).toBeDefined();
    expect(res.body.encounter_id).toEqual(69);
    expect(res.body.result_id).toEqual(420);
    expect(res.body.player_id).toEqual('admin');
    expect(res.body.energy).toEqual(415);
    if (res.body.result) {
      expect(res.body.xp).toEqual(9);
    } else {
      expect(res.body.xp).toEqual(0);
    }

    expect(getPlayerSpy).toBeCalledTimes(1);
    expect(getPlayerSpy).toBeCalledTimes(1);
    expect(getPlayerSpy).toBeCalledTimes(1);
    expect(getPlayerSpy).toBeCalledTimes(1);
  });
});
