import { RequestHandler } from 'express';

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const cookie = req.signedCookies.wallet;
    if (cookie) {
      res.cookie('wallet', cookie, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === 'prod',
        signed: true,
      });
    }
    res.locals.auth = cookie;
  } catch (err) {
    return next(err);
  }
  return next();
};
