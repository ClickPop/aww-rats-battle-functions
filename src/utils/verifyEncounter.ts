import { NextFunction, Response } from 'express';
import { errorHandler } from 'src/errors/errorHandler';
import {
  GetEncounterByIdQuery,
  GetPlayerByIdQuery,
  GetRatsByIdsQuery,
} from 'src/types';

export const verifyEncounter = (
  encounter: GetEncounterByIdQuery['encounters_by_pk'],
  rats: GetRatsByIdsQuery['rats'],
  player: GetPlayerByIdQuery['players_by_pk'],
  res: Response,
) => {
  if (encounter && rats && player) {
    if (encounter.energy_cost > player.energy) {
      return errorHandler(
        {
          code: 400,
          msg: 'user does not have enough energy',
        },
        res,
      );
    }
    if (encounter.max_rats < rats.length) {
      return errorHandler({ code: 400, msg: 'too many rats' }, res);
    }
    if (!encounter.active) {
      return errorHandler({ code: 400, msg: 'encounter is not active' }, res);
    }

    for (const constraint of encounter.encounter_rat_constraints) {
      const { rat_type, locked_slots } = constraint;
      const ratsOfType = rats.filter((r) => r.type === rat_type).length;
      if (
        rats.length > encounter.max_rats - locked_slots &&
        ratsOfType < locked_slots
      ) {
        return errorHandler(
          {
            code: 400,
            msg: `incorrect number of ${rat_type} rats sent. Expected: ${locked_slots} Recieved: ${ratsOfType}`,
          },
          res,
        );
      }
    }
  }
};
