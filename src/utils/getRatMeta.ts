import axios from 'axios';
import { rat } from '../lib/ethers';
import { Metadata } from '../types';

export const getRatMeta = async (
  ratIds: string[],
): Promise<Record<string, Metadata>> => {
  const idToMeta: Record<string, Metadata> = {};
  for (const id of ratIds) {
    const URI = await rat.tokenURI(id);
    const meta = await axios
      .get<Metadata>(URI.replace('ipfs://', 'https://ipfs.io/ipfs/'))
      .then((r) => r.data);
    idToMeta[id] = meta;
  }
  return idToMeta;
};
