import { RequestHandler } from 'express';
import { HASURA_API_KEY } from '../config/env';

export const checkApiKey: RequestHandler = async (req, res, next) => {
  try {
    const apiKey = req.headers.authorization;
    if (!apiKey || apiKey !== HASURA_API_KEY) {
      throw new Error('invalid api key on request');
    }
  } catch (err) {
    return next(err);
  }
  return next();
};
