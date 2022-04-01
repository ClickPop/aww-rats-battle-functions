import { RaidContribution, SoloEncounterAttempt } from 'src/types';
import { app } from 'src/lib/express';
import { getPlayer } from 'src/middleware/getPlayer';
import { sdk } from 'src/lib/graphql';
import { getEncounter } from 'src/middleware/getEncounter';
import { checkTokens } from 'src/middleware/checkTokens';
import { loadTokens } from 'src/middleware/loadTokens';
import { verifyEncounterMiddleware } from 'src/middleware/verifyEncounter';
import { getRaid } from 'src/middleware/getRaid';
import { verifyRaidMiddleware } from 'src/middleware/verifyRaid';
import { calculateAttempt } from 'src/middleware/calculateAttempt';
import { calculateContribution } from 'src/middleware/calculateContribution';
const { addSoloEncounterAttempt, addRaidContribution } = sdk;

const attemptSolo: SoloEncounterAttempt = async (_req, res) => {
  const { player, encounter, attempt: attemptData } = res.locals;
  if (player && encounter) {
    const attempt = await addSoloEncounterAttempt(attemptData);

    if (
      attempt.insert_solo_encounter_results_one &&
      attempt.update_players_by_pk
    ) {
      return res.json({
        encounter_id: encounter.id,
        result: attempt.insert_solo_encounter_results_one.result,
        result_id: attempt.insert_solo_encounter_results_one.id,
        player_id: attempt.update_players_by_pk.id,
        energy: attempt.update_players_by_pk.energy,
        xp: attempt.update_players_by_pk.xp,
      });
    }
  }
};

const raidContribution: RaidContribution = async (_req, res) => {
  const { player, raid, contribution: contributionData } = res.locals;
  if (player && raid) {
    const contribution = await addRaidContribution(contributionData);

    if (
      contribution.insert_raid_contributions_one &&
      contribution.update_players_by_pk
    ) {
      return res.json({
        raid_id: raid.id,
        contribution: contribution.insert_raid_contributions_one.contribution,
        faction: contribution.insert_raid_contributions_one.faction,
        contribution_id: contribution.insert_raid_contributions_one.id,
        player_id: contribution.update_players_by_pk.id,
        energy: contribution.update_players_by_pk.energy,
        xp: contribution.update_players_by_pk.xp,
      });
    }
  }
};

app.post(
  '/solo-encounter-attempt',
  getPlayer,
  getEncounter,
  checkTokens,
  loadTokens,
  verifyEncounterMiddleware,
  calculateAttempt,
  attemptSolo,
);

app.post(
  '/add-raid-contribution',
  getPlayer,
  getRaid,
  checkTokens,
  loadTokens,
  verifyRaidMiddleware,
  calculateContribution,
  raidContribution,
);
