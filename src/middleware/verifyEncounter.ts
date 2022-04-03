import { VerifyEncounterMiddleware } from 'src/types';
import { verifyEncounter } from 'src/utils/verifyEncounter';

export const verifyEncounterMiddleware: VerifyEncounterMiddleware = async (
  _req,
  res,
  next,
) => {
  const { player, encounter, rats } = res.locals;
  if (player && encounter && rats) {
    verifyEncounter(encounter, rats, player, res);
  }
  next();
};
