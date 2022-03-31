import { RaidContribution } from 'src/types';
import crypto from 'crypto';

export const calculateContribution: RaidContribution = (req, res, next) => {
  const { rats, raid, player } = res.locals;
  if (rats && raid && raid?.encounter && player) {
    const { encounter } = raid;
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
    const contribution = crypto.randomInt(min, max + 1);
    const newEnergy = player.energy - encounter.energy_cost;

    const xp =
      encounter.power / contribution +
      encounter.energy_cost +
      encounter.encounter_resistances.length -
      encounter.encounter_weaknesses.length;

    res.locals.contribution = {
      raid_id: raid.id,
      player_id: player.id,
      contribution,
      newEnergy,
      newXP: xp,
    };
    return next();
  }
};
