import { RequestHandler } from 'express';
import { HASURA_API_KEY } from 'src/config/env';
import { errorHandler } from 'src/errors/errorHandler';

export const checkApiKey: RequestHandler = async (req, res, next) => {
  const apiKey = req.headers.authorization;
  if (!apiKey || apiKey !== HASURA_API_KEY) {
    return errorHandler({ code: 401, msg: 'invalid api key on request' }, res);
  }
  return next();
};
