import { errorHandler } from 'src/errors/errorHandler';
import { sdk } from 'src/lib/graphql';
import { EncounterMiddleware } from 'src/types';
const { getEncounterById } = sdk;

export const getEncounter: EncounterMiddleware = async (req, res, next) => {
  const {
    input: { encounter_id },
  } = req.body;

  const { encounters_by_pk: encounter } = await getEncounterById({
    id: encounter_id,
  });

  if (!encounter) {
    return errorHandler({ code: 400, msg: 'encounter does not exist' }, res);
  }

  res.locals.encounter = encounter;
  next();
};
