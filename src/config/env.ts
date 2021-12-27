import { config } from 'dotenv';
config();
export const POLYGON_URL = 'https://polygon-rpc.com/';
export const COOKIE_SECRET = process.env.COOKIE_SECRET ?? '';
export const RAT_CONTRACT_ADDRESS = process.env.RAT_CONTRACT_ADDRESS ?? '';
export const CLOSET_CONTRACT_ADDRESS =
  process.env.CLOSET_CONTRACT_ADDRESS ?? '';
export const PLAYER_BASE_ENERGY = 20;
export const PORT = process.env.PORT ?? 5002;
export const HASURA_BASE_URL =
  process.env.HASURA_BASE_URL ?? 'http://localhost:8080';
