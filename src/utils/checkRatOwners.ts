import {rat} from '../lib/ethers';

export const checkRatOwners = async (
  ratIds: string[],
  address: string
): Promise<boolean> => {
  for (const id of ratIds) {
    try {
      const owner = await rat.ownerOf(id);
      if (owner !== address) {
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  }
  return true;
};
