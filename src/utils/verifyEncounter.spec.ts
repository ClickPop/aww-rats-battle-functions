import { Response } from 'express';
import * as errors from 'src/errors/errorHandler';
import { Rat_Types_Enum } from 'src/types';
import { verifyEncounter } from 'src/utils/verifyEncounter';

describe('Verify Encounter', () => {
  const errorSpy = jest.spyOn(errors, 'errorHandler');
  test('should verify a valid encounter', () => {
    const test = verifyEncounter(
      {
        id: 69,
        active: true,
        energy_cost: 5,
        power: 10,
        max_rats: 2,
        reward: {
          tokens: 10,
        },
        encounter_rat_constraints: [],
        encounter_resistances: [],
        encounter_weaknesses: [],
      },
      [
        {
          id: 69,
          type: Rat_Types_Enum.Pet,
          rattitude: 0,
          cunning: 0,
          cuteness: 7,
        },
      ],
      {
        id: 'noobmaster9000',
        energy: 20,
        max_energy: 20,
        level: 2,
        xp: 50,
        created_at: '',
        updated_at: '',
      },
      {} as Response,
    );
    expect(errorSpy.mock.calls.length).toEqual(0);
  });

  describe('should not verify an invalid encounter', () => {
    afterEach(() => {
      errorSpy.mockClear();
    });

    test('too many rats', () => {
      const test = verifyEncounter(
        {
          id: 69,
          active: true,
          energy_cost: 5,
          power: 10,
          max_rats: 1,
          reward: {
            tokens: 10,
          },
          encounter_rat_constraints: [],
          encounter_resistances: [],
          encounter_weaknesses: [],
        },
        [
          {
            id: 69,
            type: Rat_Types_Enum.Pet,
            rattitude: 0,
            cunning: 0,
            cuteness: 7,
          },
          {
            id: 70,
            type: Rat_Types_Enum.Pet,
            rattitude: 0,
            cunning: 0,
            cuteness: 7,
          },
        ],
        {
          id: 'noobmaster9000',
          energy: 20,
          max_energy: 20,
          level: 2,
          xp: 50,
          created_at: '',
          updated_at: '',
        },
        {
          status: function () {
            return this;
          },
          json: jest.fn(),
        } as unknown as Response,
      );
      expect(errorSpy.mock.calls.length).toEqual(1);
      expect(errorSpy.mock.calls[0].length).toEqual(2);
      expect(errorSpy.mock.calls[0][0]?.code).toEqual(400);
      expect(errorSpy.mock.calls[0][0]?.msg).toEqual('too many rats');
    });

    test('not enough energy', () => {
      const test = verifyEncounter(
        {
          id: 69,
          active: true,
          energy_cost: 5,
          power: 10,
          max_rats: 1,
          reward: {
            tokens: 10,
          },
          encounter_rat_constraints: [],
          encounter_resistances: [],
          encounter_weaknesses: [],
        },
        [
          {
            id: 69,
            type: Rat_Types_Enum.Pet,
            rattitude: 0,
            cunning: 0,
            cuteness: 7,
          },
        ],
        {
          id: 'noobmaster9000',
          energy: 3,
          max_energy: 20,
          level: 2,
          xp: 50,
          created_at: '',
          updated_at: '',
        },
        {
          status: function () {
            return this;
          },
          json: jest.fn(),
        } as unknown as Response,
      );
      expect(errorSpy.mock.calls.length).toEqual(1);
      expect(errorSpy.mock.calls[0].length).toEqual(2);
      expect(errorSpy.mock.calls[0][0]?.code).toEqual(400);
      expect(errorSpy.mock.calls[0][0]?.msg).toEqual(
        'user does not have enough energy',
      );
    });

    test('encounter is not active', () => {
      const test = verifyEncounter(
        {
          id: 69,
          active: false,
          energy_cost: 5,
          power: 10,
          max_rats: 1,
          reward: {
            tokens: 10,
          },
          encounter_rat_constraints: [],
          encounter_resistances: [],
          encounter_weaknesses: [],
        },
        [
          {
            id: 69,
            type: Rat_Types_Enum.Pet,
            rattitude: 0,
            cunning: 0,
            cuteness: 7,
          },
        ],
        {
          id: 'noobmaster9000',
          energy: 5,
          max_energy: 20,
          level: 2,
          xp: 50,
          created_at: '',
          updated_at: '',
        },
        {
          status: function () {
            return this;
          },
          json: jest.fn(),
        } as unknown as Response,
      );
      expect(errorSpy.mock.calls.length).toEqual(1);
      expect(errorSpy.mock.calls[0].length).toEqual(2);
      expect(errorSpy.mock.calls[0][0]?.code).toEqual(400);
      expect(errorSpy.mock.calls[0][0]?.msg).toEqual('encounter is not active');
    });

    test('incorrect rat constraints', () => {
      const test = verifyEncounter(
        {
          id: 69,
          active: true,
          energy_cost: 5,
          power: 10,
          max_rats: 2,
          reward: {
            tokens: 10,
          },
          encounter_rat_constraints: [
            {
              rat_type: Rat_Types_Enum.Lab,
              locked_slots: 1,
            },
          ],
          encounter_resistances: [],
          encounter_weaknesses: [],
        },
        [
          {
            id: 69,
            type: Rat_Types_Enum.Pet,
            rattitude: 0,
            cunning: 0,
            cuteness: 7,
          },
          {
            id: 68,
            type: Rat_Types_Enum.Pet,
            rattitude: 0,
            cunning: 0,
            cuteness: 7,
          },
        ],
        {
          id: 'noobmaster9000',
          energy: 5,
          max_energy: 20,
          level: 2,
          xp: 50,
          created_at: '',
          updated_at: '',
        },
        {
          status: function () {
            return this;
          },
          json: jest.fn(),
        } as unknown as Response,
      );
      expect(errorSpy.mock.calls.length).toEqual(1);
      expect(errorSpy.mock.calls[0].length).toEqual(2);
      expect(errorSpy.mock.calls[0][0]?.code).toEqual(400);
      expect(errorSpy.mock.calls[0][0]?.msg).toEqual(
        `incorrect number of ${
          Rat_Types_Enum.Lab
        } rats sent. Expected: ${1} Recieved: ${0}`,
      );
    });
  });
});
