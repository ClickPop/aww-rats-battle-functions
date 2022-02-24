import { SoloEncounterAttempt } from '../../types';
import { app } from '../../lib/express';
import { getPlayer } from '../../middleware/getPlayer';
import { sdk } from '../../lib/graphql';
import { checkRatOwners } from '../../utils/checkRatOwners';
import crypto from 'crypto';

const { GetRatsByIds } = sdk;

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
    if (encounter.energy_cost > player.energy) {
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

    const { rats } = await GetRatsByIds({ ids: rat_ids });

    if (rats.length < 1) {
      return res.status(500).json({ error: 'could not get rat metadata' });
    }

    for (const constraint of encounter.encounter_rat_constraints) {
      const { rat_type, locked_slots } = constraint;
      const ratsOfType = rats.filter((r) => r.type === rat_type).length;
      if (
        rats.length > encounter.max_rats - locked_slots &&
        ratsOfType < locked_slots
      ) {
        return res.status(400).json({
          error: `Incorrect number of ${rat_type} rats sent. Expected: ${locked_slots} Recieved: ${ratsOfType}`,
        });
      }
    }

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

    const min = rat_ids.length + modifier;
    const max = rat_ids.length * 6 + modifier;
    const rand = crypto.randomInt(min, max + 1);
    const result = rand >= encounter.power;
    const newEnergy = player.energy - encounter.energy_cost;

    const xp = result
      ? encounter.power +
        encounter.energy_cost +
        encounter.encounter_resistances.length -
        encounter.encounter_weaknesses.length
      : 0;

    const attempt = await addSoloEncounterAttempt({
      encounter_id,
      player_id: player.id,
      result,
      newEnergy,
      newXP: xp,
      reward: result ? encounter.reward.tokens : 0,
    });

    if (
      attempt.insert_solo_encounter_results_one &&
      attempt.update_players_by_pk
    ) {
      return res.json({
        encounter_id,
        result: attempt.insert_solo_encounter_results_one.result,
        result_id: attempt.insert_solo_encounter_results_one.id,
        player_id: attempt.update_players_by_pk.id,
        energy: attempt.update_players_by_pk.energy,
        xp: attempt.update_players_by_pk.xp,
      });
    }
  } else return res.status(401).json({ error: 'Player does not exist' });
};

app.post('/solo-encounter-attempt', getPlayer, attempt);
