const dotenv = require('dotenv');
dotenv.config();

let hasuraEndoint = `${process.env.HASURA_BASE_URL}/v1/graphql`;

module.exports = {
  schema: [
    {
      [hasuraEndoint]: {
        headers: {
          'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
        },
      },
    },
  ],
  documents: ['./src/**/*.ts', './src/**/*.gql'],
  overwrite: true,
  generates: {
    './src/schema/schema.g.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-graphql-request',
      ],
      config: {
        noGraphQLTag: true,
        documentMode: 'documentNode',
      },
    },
    './src/schema/graphql.schema.json': {
      plugins: ['introspection'],
    },
  },
};
