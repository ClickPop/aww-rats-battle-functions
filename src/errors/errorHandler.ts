import { Response } from 'express';
import { ErrorObj } from 'src/types';

export const errorHandler = (err: ErrorObj | undefined, res: Response) => {
  console.error(err?.error ?? `${err?.code}: ${err?.msg}`);
  return res
    .status(err?.code ?? 500)
    .json({ error: err?.msg ?? 'an unexpected error occurred' });
};
