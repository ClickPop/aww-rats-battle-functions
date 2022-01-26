import { SoloEncounterAttempt } from '../../types';
import { app } from '../../lib/express';
import { getPlayer } from '../../middleware/getPlayer';
import { sdk } from '../../lib/graphql';
import { checkRatOwners } from '../../utils/checkRatOwners';
import { getRatMeta } from '../../utils/getRatMeta';
import crypto from 'crypto';

const attempt: SoloEncounterAttempt = async (req, res) => {
  const { encounter_id, rat_ids } = req.body.input;
  const { player } = res.locals;
  const { getEncounterById, addSoloEncounterAttempt } = sdk;
  if (player) {
    const { encounters_by_pk: encounter } = await getEncounterById({
      id: encounter_id,
    });
    if (!encounter) {
      return res.status(400).json({ error: 'encounter does not exist' });
    }
    const ownsAllRats = await checkRatOwners(rat_ids, player.id);
    if (!ownsAllRats) {
      return res
        .status(400)
        .json({ error: 'user does not own all submitted rats' });
    }
    if (encounter.energy_cost >= player.energy) {
      return res
        .status(400)
        .json({ error: 'user does not have enough energy' });
    }
    if (encounter.max_rats < rat_ids.length) {
      return res.status(400).json({ error: 'too many rats' });
    }
    if (!encounter.active) {
      return res.status(400).json({ error: 'encounter is not active' });
    }

    const ratMeta = await getRatMeta(rat_ids);

    if (Object.keys(ratMeta).length < 1) {
      return res.status(500).json({ error: 'could not get rat metadata' });
    }

    const rattributes = Object.entries(ratMeta).reduce(
      (acc, [id, rat]) => ({
        ...acc,
        [id]: {
          ...rat.attributes
            .filter((a) =>
              ['cuteness', 'cunning', 'rattitude'].includes(
                a.trait_type?.toLowerCase() ?? '',
              ),
            )
            .reduce(
              (acc, curr) => ({
                ...acc,
                [curr.trait_type?.toLowerCase() ?? '']: curr.value,
              }),
              {} as { cunning: number; cuteness: number; rattitude: number },
            ),
          ratType:
            rat.attributes
              .find((a) => a.trait_type?.toLowerCase() === 'type')
              ?.value.toString()
              .toUpperCase()
              .split(' ')[0] ?? '',
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

    const modifier =
      weaknesses.reduce(
        (acc, curr) =>
          acc +
          Object.entries(rattributes).reduce(
            (a, c) => a + (c[curr.toLowerCase() as keyof typeof c] as number),
            0,
          ),
        0,
      ) -
      resistances.reduce(
        (acc, curr) =>
          acc +
          Object.entries(rattributes).reduce(
            (a, c) => a + (c[curr.toLowerCase() as keyof typeof c] as number),
            0,
          ),
        0,
      );

    const min = rat_ids.length + modifier;
    const max = rat_ids.length * 6 + modifier;
    const rand = crypto.randomInt(min, max + 1);
    const result = rand >= encounter.power;
    const newEnergy = player.energy - encounter.energy_cost;

    const attempt = await addSoloEncounterAttempt({
      encounter_id,
      player_id: player.id,
      result,
      newEnergy,
    });

    return res.json({ result });
  } else return res.status(401).json({ error: 'Player does not exist' });
};

app.post('/solo-encounter-attempt', getPlayer, attempt);
