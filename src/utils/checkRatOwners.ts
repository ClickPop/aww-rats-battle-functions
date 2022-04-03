import { rat } from 'src/lib/ethersService';

export const checkRatOwners = async (
  ratIds: string[],
  address: string,
): Promise<boolean> => {
  for (const id of ratIds) {
    try {
      const owner = await rat.ownerOf(id);
      return owner === address;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  return true;
};
