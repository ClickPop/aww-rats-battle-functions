import { RequestHandler } from 'express';
import { errorHandler } from 'src/errors/errorHandler';

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const cookie = req.signedCookies.wallet;
    if (cookie) {
      res.cookie('wallet', cookie, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === 'prod',
        httpOnly: true,
        signed: true,
      });
    }
    res.locals.auth = cookie;
  } catch (err) {
    return errorHandler(
      { code: 500, msg: 'error authenticating', error: err as Error },
      res,
    );
  }
  return next();
};
