import { SoloEncounterAttempt } from 'src/types';
import crypto from 'crypto';

export const calculateAttempt: SoloEncounterAttempt = (_req, res, next) => {
  const { rats, encounter, player } = res.locals;
  if (rats && encounter && player) {
    const rattributes = rats.reduce(
      (acc, rat) => ({
        ...acc,
        [rat.id]: {
          ...rat,
        },
      }),
      {} as Record<
        string,
        {
          cunning: number;
          cuteness: number;
          rattitude: number;
          ratType: string;
        }
      >,
    );

    const weaknesses = encounter.encounter_weaknesses.map(
      (item) => item.weakness,
    );
    const resistances = encounter.encounter_resistances.map(
      (item) => item.resistance,
    );

    const weakness = weaknesses.reduce(
      (acc, curr) =>
        acc +
        Object.values(rattributes).reduce(
          (a, c) => a + (c[curr.toLowerCase() as keyof typeof c] as number),
          0,
        ),
      0,
    );

    const resistance = resistances.reduce(
      (acc, curr) =>
        acc +
        Object.values(rattributes).reduce(
          (a, c) => a + (c[curr.toLowerCase() as keyof typeof c] as number),
          0,
        ),
      0,
    );

    const modifier = weakness - resistance;

    const min = rats.length + modifier;
    const max = rats.length * 6 + modifier;
    const rand = crypto.randomInt(min, max + 1);
    const result = rand >= encounter.power;
    const newEnergy = player.energy - encounter.energy_cost;

    const xp = result
      ? encounter.power +
        encounter.energy_cost +
        encounter.encounter_resistances.length -
        encounter.encounter_weaknesses.length
      : 0;

    res.locals.attempt = {
      encounter_id: encounter.id,
      player_id: player.id,
      result,
      newEnergy,
      newXP: xp,
      reward: result ? encounter.reward.tokens : 0,
    };
    return next();
  }
};
