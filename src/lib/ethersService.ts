import { ethers } from 'ethers';
import { POLYGON_URL, RAT_CONTRACT_ADDRESS } from 'src/config/env';

const abi = [
  'function ownerOf(uint tokenId) view returns (address)',
  'function tokenURI(uint tokenId) view returns (string memory)',
];

export const provider = new ethers.providers.JsonRpcProvider(POLYGON_URL);

export const rat = new ethers.Contract(RAT_CONTRACT_ADDRESS, abi, provider);
