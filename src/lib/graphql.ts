import { GraphQLClient } from 'graphql-request';
import { HASURA_ADMIN_SECRET, HASURA_BASE_URL } from 'src/config/env';
import { getSdk } from 'src/types';

const client = new GraphQLClient(`${HASURA_BASE_URL}/v1/graphql`, {
  headers: { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET },
});

export const sdk = getSdk(client);
