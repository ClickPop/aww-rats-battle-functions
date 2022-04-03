import { checkRatOwners } from 'src/utils/checkRatOwners';

describe('Check Rat Owners', () => {
  test('should return correct status between owner and rat ids', async () => {
    const isOwner = await checkRatOwners(['69'], 'admin');
    expect(isOwner).toBe(true);
  });

  test('should return null if they are mismatched', async () => {
    const isOwner = await checkRatOwners(['69'], 'not-admin');
    expect(isOwner).toBe(false);
  });
});
