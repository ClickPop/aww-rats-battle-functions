import { PlayerMiddleware } from 'src/types';
import { sdk } from 'src/lib/graphql';
import { errorHandler } from 'src/errors/errorHandler';

const { getPlayerById } = sdk;

export const getPlayer: PlayerMiddleware = async (req, res, next) => {
  try {
    const wallet = req.body.session_variables['x-hasura-user-id'];
    if (!wallet) {
      return errorHandler({ msg: 'missing wallet', code: 401 }, res);
    }
    const data = await getPlayerById({
      id: wallet,
    });
    if (!data.players_by_pk) {
      return errorHandler({ code: 401, msg: 'player does not exist' }, res);
    }
    res.locals.player = data.players_by_pk!;
  } catch (err) {
    return errorHandler(
      {
        code: 500,
        msg: 'error retrieving player',
        error: err as Error,
      },
      res,
    );
  }
  return next();
};
