import { compareAsc } from 'date-fns';
import { errorHandler } from 'src/errors/errorHandler';
import { VerifyRaidMiddleware } from 'src/types';
import { verifyEncounter } from 'src/utils/verifyEncounter';

export const verifyRaidMiddleware: VerifyRaidMiddleware = async (_req, res) => {
  const { player, raid, rats } = res.locals;
  if (player && raid && raid?.encounter && rats) {
    if (!raid.active) {
      return errorHandler({ code: 400, msg: 'raid is not active' }, res);
    }

    if (compareAsc(raid.start_timestamp, new Date().getUTCDate()) < 1) {
      return errorHandler({ code: 400, msg: 'raid has not started yet' }, res);
    }

    if (
      compareAsc(raid.end_timestamp, new Date().getUTCDate()) >= 1 ||
      raid.result === true
    ) {
      return errorHandler({ code: 400, msg: 'raid has ended' }, res);
    }

    verifyEncounter(
      { ...raid.encounter, active: raid.active, reward: raid.reward },
      rats,
      player,
      res,
    );
  }
};
