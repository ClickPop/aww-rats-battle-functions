import { RequestHandler } from 'express';
import { GraphQLClient } from 'graphql-request';
import { HASURA_BASE_URL } from 'src/config/env';
import { getSdk } from 'src/types';

const client = new GraphQLClient(`${HASURA_BASE_URL}/v1/graphql`);

const sdk = getSdk(client);

export const getPlayer: RequestHandler = async (req, res, next) => {
  try {
    const wallet = res.locals.auth;
    const { getPlayerById } = sdk;
    const data = await getPlayerById({
      id: wallet,
    });
    res.locals.player = data.players_by_pk;
  } catch (err) {
    return next(err);
  }
  return next();
};
