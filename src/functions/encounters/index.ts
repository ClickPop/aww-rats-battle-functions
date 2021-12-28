// app.post('/attempt', authMiddleware, checkPlayer, async (req, res) => {
//   try {
//     const player = res.locals.player as Player;
//     const { encounterId, ratIds } = req.body;

//     const ownsAllRats = await checkRatOwners(ratIds, player.id);

//     if (!ownsAllRats) {
//       return res
//         .status(400)
//         .json({ error: 'User does not own all submitted rats' });
//     }

//     const encounter = await client.encounter.findFirst({
//       where: {
//         id: encounterId,
//       },
//       include: {
//         reward: true,
//       },
//     });

//     if (!encounter) {
//       return res.status(400).json({ error: 'encounter does not exist' });
//     }

//     if (encounter.energy_cost > player.energy) {
//       return res
//         .status(400)
//         .json({ error: 'player does not have required energy' });
//     }

//     if (encounter.max_rats < ratIds.length) {
//       return res.status(400).json({ error: 'TOO MANY RATS' });
//     }

//     if (!encounter.active) {
//       return res.status(400).json({ error: 'Encounter is not active' });
//     }

//     const result = await client.solo_Encounter_Results.findFirst({
//       where: {
//         encounter_id: encounter.id,
//         player_id: player.id,
//         completed_timestamp: {
//           lte: sub(new Date(), {
//             hours: 24,
//           }),
//         },
//       },
//       orderBy: [{ completed_timestamp: 'desc' }],
//     });

//     if (result) {
//       return res.status(400).json({ error: 'encounter still cooling down' });
//     }

//     const ratMeta = await getRatMeta(ratIds);

//     const rattributes = Object.entries(ratMeta).reduce(
//       (acc, [id, rat]) => ({
//         ...acc,
//         [id]: {
//           ...rat.attributes
//             .filter((a) =>
//               ['cuteness', 'cunning', 'rattitude'].includes(
//                 a.trait_type?.toLowerCase() ?? '',
//               ),
//             )
//             .reduce(
//               (acc, curr) => ({
//                 ...acc,
//                 [curr.trait_type?.toLowerCase() ?? '']: curr.value,
//               }),
//               {} as { cunning: number; cuteness: number; rattitude: number },
//             ),
//           ratType:
//             rat.attributes
//               .find((a) => a.trait_type?.toLowerCase() === 'type')
//               ?.value.toString()
//               .toUpperCase()
//               .split(' ')[0] ?? '',
//         },
//       }),
//       {} as Record<
//         string,
//         {
//           cunning: number;
//           cuteness: number;
//           rattitude: number;
//           ratType: string;
//         }
//       >,
//     );

//     const additionalVals =
//       encounter.weaknesses.reduce(
//         (acc, curr) =>
//           acc +
//           Object.entries(rattributes).reduce(
//             (a, c) => a + (c[curr.toLowerCase() as keyof typeof c] as number),
//             0,
//           ),
//         0,
//       ) -
//       encounter.resistances.reduce(
//         (acc, curr) =>
//           acc +
//           Object.entries(rattributes).reduce(
//             (a, c) => a + (c[curr.toLowerCase() as keyof typeof c] as number),
//             0,
//           ),
//         0,
//       );

//     const min = ratIds.length + additionalVals;

//     const max = ratIds.length * 6 + additionalVals;

//     const rand = crypto.randomInt(min, max + 1);

//     await client.solo_Encounter_Results.create({
//       data: {
//         encounter_id: encounter.id,
//         player_id: player.id,
//         result: rand >= encounter.power,
//         completed_timestamp: new Date(),
//       },
//     });

//     await client.player.update({
//       where: {
//         id: player.id,
//       },
//       data: {
//         energy: player.energy - encounter.energy_cost,
//       },
//     });

//     if (rand < encounter.power) {
//       return res.json({ result: 'LOSE' });
//     }

//     return res.json({ result: 'WIN' });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ error: 'An error occured lol' });
//   }
// });
