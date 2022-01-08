import { RequestHandler } from 'express';
import { sdk } from '../lib/graphql';

export const getPlayer: RequestHandler = async (req, res, next) => {
  try {
    const wallet = req.body.session_variables['x-hasura-user-id']
    const { getPlayerById } = sdk;
    const data = await getPlayerById({
      id: wallet,
    });
    if(!data.players_by_pk)
    {
      return res.status(401).json( { error: 'Player does not exist' } )
    }
    res.locals.player = data.players_by_pk;
  } catch (err) {
    return next(err);
  }
  return next();
};
