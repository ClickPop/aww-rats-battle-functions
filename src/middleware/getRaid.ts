import { errorHandler } from 'src/errors/errorHandler';
import { sdk } from 'src/lib/graphql';
import { RaidMiddleware } from 'src/types';
const { getRaidbyId } = sdk;

export const getRaid: RaidMiddleware = async (req, res, next) => {
  const {
    input: { raid_id },
  } = req.body;

  const { raids_by_pk: raid } = await getRaidbyId({
    id: raid_id,
  });

  if (!raid) {
    return errorHandler({ code: 400, msg: 'raid does not exist' }, res);
  }

  res.locals.raid = raid;
  next();
};
