import { errorHandler } from 'src/errors/errorHandler';
import { CheckTokenMiddleware } from 'src/types';
import { checkRatOwners } from 'src/utils/checkRatOwners';

export const checkTokens: CheckTokenMiddleware = async (req, res, next) => {
  const {
    input: { rat_ids },
  } = req.body;
  const { player } = res.locals;
  if (!!player) {
    const ownsAllRats = await checkRatOwners(rat_ids, player.id);
    if (!ownsAllRats) {
      return errorHandler(
        {
          code: 400,
          msg: 'user does not own all submitted rats',
        },
        res,
      );
    }
    return next();
  }
  return errorHandler({ code: 400, msg: 'player not found' }, res);
};
