import { sdk as SDK } from '../graphql';
import {
  Encounter_Types_Enum,
  GetEncounterByIdQuery,
  GetPlayerByIdQuery,
  GetRaidContributionsQuery,
  GetRaidbyIdQuery,
  Rat_Types_Enum,
  GetRatsByIdsQuery,
  Roles_Enum,
} from 'src/schema/schema.g';

const getRaidById = (id: number) => {
  const raids_by_pk: GetRaidbyIdQuery['raids_by_pk'] = {
    id,
    active: true,
    start_timestamp: '',
    end_timestamp: '',
    result: null,
    encounter: getEncounterById(69)!,
    reward: {
      tokens: 69,
    },
  };
  switch (id) {
    case 69:
      return raids_by_pk;
    default:
      return null;
  }
};

const getEncounterById = (id: number) => {
  const encounters_by_pk: GetEncounterByIdQuery['encounters_by_pk'] = {
    id,
    active: true,
    power: 4,
    energy_cost: 5,
    max_rats: 2,
    reward: {
      tokens: 69,
    },
    encounter_rat_constraints: [],
    encounter_resistances: [],
    encounter_weaknesses: [],
  };

  switch (id) {
    case 69:
      return encounters_by_pk;
    default:
      return null;
  }
};

const getPlayerById = (id: string) => {
  const players_by_pk: GetPlayerByIdQuery['players_by_pk'] = {
    id,
    level: 69,
    energy: 420,
    max_energy: 666,
    xp: 9000,
    created_at: '2069-04-20T04:20:00+0420',
    updated_at: '2069-04-20T04:20:00+0420',
  };

  switch (id) {
    case 'admin':
      return players_by_pk;
    default:
      return null;
  }
};

export const sdk: typeof SDK = {
  addRaidContribution: jest.fn(
    ({
      player_id: id,
      contribution,
      newEnergy: energy,
      newXP: xp,
      faction,
    }) => {
      return Promise.resolve({
        insert_raid_contributions_one: {
          contribution,
          contribution_timestamp: '2069-04-20T04:20:00+0420',
          faction,
          id: 'fake_id',
        },
        update_players_by_pk: {
          energy,
          xp,
          id,
        },
      });
    },
  ),
  addSoloEncounterAttempt: jest.fn(
    ({ result, player_id: id, newEnergy: energy, newXP: xp }) => {
      return Promise.resolve({
        insert_solo_encounter_results_one: {
          id: 420,
          result,
        },
        update_players_by_pk: {
          energy,
          xp,
          id,
        },
      });
    },
  ),
  clearZeroTokens: jest.fn(() => {
    return Promise.resolve({
      delete_closet_tokens: {
        affected_rows: 666,
      },
    });
  }),
  combinedCache: jest.fn(() => {
    return Promise.resolve({
      insert_rats: {
        returning: [{ id: 69 }, { id: 420 }, { id: 666 }],
      },
      insert_closet_pieces: {
        returning: [{ id: 69 }, { id: 420 }, { id: 666 }],
      },
      insert_closet_tokens: {
        returning: [
          { owner: 'noobmaster9000', amount: 69, token_id: 420 },
          { owner: 'noobmaster9000', amount: 69, token_id: 666 },
        ],
      },
    });
  }),
  getEncounterById: jest.fn(({ id }) => {
    return Promise.resolve({ encounters_by_pk: getEncounterById(id) });
  }),
  getPlayerById: jest.fn(({ id }) => {
    return Promise.resolve({ players_by_pk: getPlayerById(id) });
  }),
  getRaidContributions: jest.fn(({ raid_id }) => {
    const raids_by_pk: GetRaidContributionsQuery['raids_by_pk'] = {
      encounter: {
        power: 9000,
        encounter_type: Encounter_Types_Enum.Solo,
      },
      reward: {
        tokens: 69,
      },
      lab: [],
      lab_sum: {
        aggregate: {
          sum: {
            contribution: 0,
          },
        },
      },
      pack: [],
      pack_sum: {
        aggregate: {
          sum: {
            contribution: 0,
          },
        },
      },
      pet: [],
      pet_sum: {
        aggregate: {
          sum: {
            contribution: 0,
          },
        },
      },
      street: [],
      street_sum: {
        aggregate: {
          sum: {
            contribution: 0,
          },
        },
      },
      total: [],
      total_sum: {
        aggregate: {
          sum: {
            contribution: 0,
          },
        },
      },
    };

    switch (raid_id) {
      case 68:
        return Promise.resolve({
          raids_by_pk: {
            ...raids_by_pk,
            encounter: { power: 0, encounter_type: Encounter_Types_Enum.Solo },
          },
        });
      case 69:
        return Promise.resolve({
          raids_by_pk: {
            ...raids_by_pk,
            encounter: {
              power: 100,
              encounter_type: Encounter_Types_Enum.CommunityRaid,
            },
            total: [
              {
                player_id: 'player1',
                contribution: 10,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player2',
                contribution: 7,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player3',
                contribution: 18,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player4',
                contribution: 5,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player5',
                contribution: 23,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player6',
                contribution: 20,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player7',
                contribution: 12,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player8',
                contribution: 5,
                contribution_timestamp: 'fake-timestamp',
              },
            ],
            total_sum: { aggregate: { sum: { contribution: 100 } } },
          },
        });
      case 70:
        return Promise.resolve({
          raids_by_pk: {
            ...raids_by_pk,
            encounter: {
              power: 50,
              encounter_type: Encounter_Types_Enum.FactionRaid,
            },
            lab: [
              {
                player_id: 'player1',
                contribution: 10,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player2',
                contribution: 7,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player3',
                contribution: 18,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player4',
                contribution: 5,
                contribution_timestamp: 'fake-timestamp',
              },
            ],
            lab_sum: {
              aggregate: {
                sum: {
                  contribution: 40,
                },
              },
            },
            pack: [
              {
                player_id: 'player1',
                contribution: 11,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player2',
                contribution: 8,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player3',
                contribution: 13,
                contribution_timestamp: 'fake-timestamp',
              },
            ],
            pack_sum: {
              aggregate: {
                sum: {
                  contribution: 32,
                },
              },
            },
            street: [
              {
                player_id: 'player1',
                contribution: 10,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player2',
                contribution: 7,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player3',
                contribution: 18,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player4',
                contribution: 5,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player5',
                contribution: 3,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player6',
                contribution: 8,
                contribution_timestamp: 'fake-timestamp',
              },
            ],
            street_sum: {
              aggregate: {
                sum: {
                  contribution: 51,
                },
              },
            },
            pet: [
              {
                player_id: 'player1',
                contribution: 11,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player2',
                contribution: 8,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player3',
                contribution: 13,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player4',
                contribution: 12,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player5',
                contribution: 9,
                contribution_timestamp: 'fake-timestamp',
              },
              {
                player_id: 'player6',
                contribution: 15,
                contribution_timestamp: 'fake-timestamp',
              },
            ],
            pet_sum: {
              aggregate: {
                sum: {
                  contribution: 69,
                },
              },
            },
          },
        });
      default:
        return Promise.resolve({ raids_by_pk: null });
    }
  }),
  getRaidbyId: jest.fn(({ id }) => {
    return Promise.resolve({ raids_by_pk: getRaidById(id) });
  }),
  getRatsByIds: jest.fn(({ ids }) => {
    const rats: GetRatsByIdsQuery['rats'] = [
      {
        id: '69',
        type: Rat_Types_Enum.Pet,
        cunning: 0,
        cuteness: 7,
        rattitude: 0,
      },
    ];

    return Promise.resolve({ rats: rats.filter((r) => ids.includes(r.id)) });
  }),
  getUserRole: jest.fn(({ wallet }) => {
    switch (wallet) {
      case 'admin':
        return Promise.resolve({
          users_roles_by_pk: { role: Roles_Enum.Admin },
        });
      case 'user':
        return Promise.resolve({
          users_roles_by_pk: { role: Roles_Enum.User },
        });
      default:
        return Promise.resolve({
          users_roles_by_pk: { role: Roles_Enum.Anonymous },
        });
    }
  }),
  handleRaidPayout: jest.fn(({ players, payout, closetItems }) => {
    const multipleClosetItems = Array.isArray(closetItems);
    const multiplePlayers = Array.isArray(players);

    return Promise.resolve({
      insert_closet_tokens: {
        affected_rows: multipleClosetItems ? closetItems.length : 1,
        returning: multipleClosetItems
          ? closetItems.map((c) => ({
              amount: c.amount,
              owner: c.owner!,
              token_id: c.token_id,
            }))
          : [
              {
                amount: closetItems.amount,
                owner: closetItems.owner!,
                token_id: closetItems.token_id,
              },
            ],
      },
      update_players: {
        affected_rows: multiplePlayers ? players.length : 1,
        returning: multiplePlayers
          ? players.map((p) => ({ id: p, tokens: payout }))
          : [{ id: players, tokens: payout }],
      },
    });
  }),
  resetEnergy: jest.fn(() => {
    return Promise.resolve({
      reset_energy: [
        {
          energy: 69,
        },
      ],
    });
  }),
  updateRaid: jest.fn(({ raid_id, input }) => {
    return Promise.resolve({
      update_raids_by_pk: {
        id: raid_id,
        active: input.active ?? true,
        result: input.result ?? null,
        start_timestamp: input.start_timestamp ?? '2069-04-20T04:20:00+0420',
        end_timestamp: input.end_timestamp ?? '2069-04-22T04:20:00+0420',
        end_event_id: input.end_event_id ?? null,
        winning_faction: input.winning_faction ?? null,
      },
    });
  }),
  upsertPlayer: jest.fn(({ id }) => {
    return Promise.resolve({ insert_players_one: getPlayerById(id) });
  }),
};
