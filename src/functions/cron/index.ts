import { sdk } from 'src/lib/graphql';
import { app } from 'src/lib/express';
import {
  Encounter_Types_Enum,
  HandleRaidPayoutMutation,
  HasuraActionHandler,
  HasuraEventHandler,
  HasuraTriggerHandler,
  Rat_Types_Enum,
  ResetEnergyMutation,
} from 'src/types';
import { checkApiKey } from 'src/middleware/checkApiKey';
import { hasuraMetadataApi } from 'src/lib/hasura';
import { errorHandler } from 'src/errors/errorHandler';

const { resetEnergy, getRaidContributions, handleRaidPayout } = sdk;

const resetEnergyEndpint: HasuraActionHandler<
  ResetEnergyMutation['reset_energy'] | { error: unknown }
> = async (_, res) => {
  try {
    const result = await resetEnergy();
    return res.json(result.reset_energy);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
};

const handleRaidTrigger: HasuraTriggerHandler<
  { message: string; event_id?: string } | 'no change'
> = async (req, res) => {
  try {
    switch (req.body.event.op) {
      case 'INSERT':
        if (
          // Checks that there is new data
          req.body.event.data.new &&
          // Checks that the new id exists and is of type number
          req.body.event.data.new.id &&
          typeof req.body.event.data.new.id === 'number' &&
          // Checks that the new data is active
          req.body.event.data.new.active &&
          // Checks that the new timestamp is a string
          req.body.event.data.new.end_timestamp &&
          typeof req.body.event.data.new.end_timestamp === 'string'
        ) {
          const data = await hasuraMetadataApi.createRaidEndEvent(
            req.body.event.data.new.id,
            req.body.event.data.new.end_timestamp,
          );
          return res.json(data);
        }
        return res.send('no change');
      case 'UPDATE':
        // Checks that there is both new and old data
        if (req.body.event.data.new && req.body.event.data.old) {
          let data: { message: 'success'; event_id?: string } = {
            message: 'success',
          };
          if (
            // Checks that the new id exists and is of type number
            req.body.event.data.new.id &&
            typeof req.body.event.data.new.id === 'number' &&
            // Checks that the new data is active
            req.body.event.data.new.active &&
            // Checks that the new timestamp is a string
            req.body.event.data.new.end_timestamp &&
            typeof req.body.event.data.new.end_timestamp === 'string' &&
            // Checks that the old timestamp is a string
            req.body.event.data.old.end_timestamp &&
            typeof req.body.event.data.old.end_timestamp === 'string' &&
            // Checks that the new timestamp is different than the old timestamp or the old state of active was false
            (req.body.event.data.new.end_timestamp !==
              req.body.event.data.old.end_timestamp ||
              !req.body.event.data.old.active)
          ) {
            data = await hasuraMetadataApi.createRaidEndEvent(
              req.body.event.data.new.id,
              req.body.event.data.new.end_timestamp,
            );
          }

          if (
            // Checks that the new id exists and is of type number
            req.body.event.data.new.id &&
            typeof req.body.event.data.new.id === 'number' &&
            // Checks that there is an end_event_id of type string
            req.body.event.data.new.end_event_id &&
            typeof req.body.event.data.new.end_event_id === 'string' &&
            // Checks if the event data is now inactive or the new timestamp is different than the old timestamp
            (!req.body.event.data.new.active ||
              // Checks that the new timestamp is a string
              (req.body.event.data.new.end_timestamp &&
                typeof req.body.event.data.new.end_timestamp === 'string' &&
                // Checks that the old timestamp is a string
                req.body.event.data.old.end_timestamp &&
                typeof req.body.event.data.old.end_timestamp === 'string' &&
                // Checks that the new timestamp is different than the old timestamp
                req.body.event.data.new.end_timestamp !==
                  req.body.event.data.old.end_timestamp))
          ) {
            data = await hasuraMetadataApi.deleteRaidEndEvent(
              req.body.event.data.new.id,
              req.body.event.data.new.end_event_id,
            );
          }
          return res.json(data);
        }
        return res.send('no change');
      case 'DELETE':
        if (
          // Checks that there is old data
          req.body.event.data.old &&
          // Checks that the old id is of type number
          req.body.event.data.old.id &&
          typeof req.body.event.data.old.id === 'number' &&
          // Checks that the old end_event_id is of type string
          req.body.event.data.old.end_event_id &&
          typeof req.body.event.data.old.end_event_id === 'string'
        ) {
          const data = await hasuraMetadataApi.deleteRaidEndEvent(
            req.body.event.data.old.id,
            req.body.event.data.old.end_event_id,
          );
          return res.json(data);
        }
        return res.send('no change');
      default:
        throw new Error('unrecognized event trigger operation');
    }
  } catch (err) {
    return errorHandler(
      { code: 500, msg: 'An error occurred', error: err as Error },
      res,
    );
  }
};

const handleRaidEnd: HasuraEventHandler<HandleRaidPayoutMutation> = async (
  req,
  res,
) => {
  const { payload } = req.body;

  if (payload?.raid_id && typeof payload.raid_id === 'number') {
    const raidWithContributions = await getRaidContributions({
      raid_id: payload.raid_id,
    });

    if (!raidWithContributions.raids_by_pk) {
      return errorHandler(
        {
          code: 404,
          msg: `encounter with id ${payload.raid_id} does not exist`,
        },
        res,
      );
    }

    if (
      ![
        Encounter_Types_Enum.FactionRaid,
        Encounter_Types_Enum.CommunityRaid,
      ].includes(raidWithContributions.raids_by_pk.encounter.encounter_type)
    ) {
      return errorHandler(
        { code: 400, msg: 'encounter is not a raid type' },
        res,
      );
    }

    if (
      raidWithContributions.raids_by_pk?.encounter.encounter_type ===
      Encounter_Types_Enum.FactionRaid
    ) {
      const factionsByContribution = [
        {
          type: Rat_Types_Enum.Lab,
          contribution:
            raidWithContributions.raids_by_pk.lab_sum.aggregate?.sum
              ?.contribution ?? 0,
          players: raidWithContributions.raids_by_pk.lab,
        },
        {
          type: Rat_Types_Enum.Pack,
          contribution:
            raidWithContributions.raids_by_pk.pack_sum.aggregate?.sum
              ?.contribution ?? 0,
          players: raidWithContributions.raids_by_pk.pack,
        },
        {
          type: Rat_Types_Enum.Pet,
          contribution:
            raidWithContributions.raids_by_pk.pet_sum.aggregate?.sum
              ?.contribution ?? 0,
          players: raidWithContributions.raids_by_pk.pet,
        },
        {
          type: Rat_Types_Enum.Street,
          contribution:
            raidWithContributions.raids_by_pk.street_sum.aggregate?.sum
              ?.contribution ?? 0,
          players: raidWithContributions.raids_by_pk.street,
        },
      ].sort((a, b) => a.contribution - b.contribution);

      const largest = factionsByContribution[factionsByContribution.length - 1];

      if (
        (largest?.contribution ?? 0) >=
        raidWithContributions.raids_by_pk.encounter.power
      ) {
        const checkForMultipleLargest = factionsByContribution.filter(
          (f) => f.contribution === largest?.contribution,
        );

        const players =
          (checkForMultipleLargest.length > 1
            ? Array.from(
                checkForMultipleLargest.reduce((acc, curr) => {
                  return new Set([
                    ...acc,
                    ...curr.players.map((p) => p.player_id),
                  ]);
                }, new Set<string>()),
              )
            : largest?.players.map((p) => p.player_id)) ?? [];

        const payout = await handleRaidPayout({
          players,
          payout: raidWithContributions.raids_by_pk?.reward.tokens ?? 0,
          // TODO Add support for closet items
          closetItems: [],
        });
        return res.json(payout);
      }
      return errorHandler({ code: 400, msg: 'not enough contributions' }, res);
    } else if (
      raidWithContributions.raids_by_pk?.encounter.encounter_type ===
        Encounter_Types_Enum.CommunityRaid &&
      (raidWithContributions.raids_by_pk.total_sum.aggregate?.sum
        ?.contribution ?? 0) >=
        raidWithContributions.raids_by_pk?.encounter.power
    ) {
      const payout = await handleRaidPayout({
        players: raidWithContributions.raids_by_pk.total.map(
          (p) => p.player_id,
        ),
        payout: raidWithContributions.raids_by_pk?.reward.tokens ?? 0,
        // TODO Add support for closet items
        closetItems: [],
      });
      return res.json(payout);
    }
  }
  return errorHandler({ code: 400, msg: 'missing raid_id' }, res);
};

app.post('/cron/reset-energy', checkApiKey, resetEnergyEndpint);

app.post('/cron/handle-raid-trigger', checkApiKey, handleRaidTrigger);

app.post('/cron/handle-raid-end', checkApiKey, handleRaidEnd);
