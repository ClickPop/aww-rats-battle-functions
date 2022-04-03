import { errorHandler } from 'src/errors/errorHandler';
import { sdk } from 'src/lib/graphql';
import { RatMiddleware } from 'src/types';

const { getRatsByIds } = sdk;

export const loadTokens: RatMiddleware = async (req, res, next) => {
  const {
    input: { rat_ids },
  } = req.body;
  const { rats } = await getRatsByIds({ ids: rat_ids });
  if (rats.length < 1) {
    return errorHandler({ code: 500, msg: 'could not get rat metadata' }, res);
  }
  res.locals.rats = rats;
  next();
};
