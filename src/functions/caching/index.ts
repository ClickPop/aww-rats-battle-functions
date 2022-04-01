import { sdk } from 'src/lib/graphql';
import { app } from 'src/lib/express';
import { HasuraActionHandler, ClearZeroTokensMutation } from 'src/types';
import { checkApiKey } from 'src/middleware/checkApiKey';

const { clearZeroTokens } = sdk;

const clearZeroTokensEndpoint: HasuraActionHandler<
  ClearZeroTokensMutation['delete_closet_tokens'] | { error: unknown }
> = async (_, res) => {
  try {
    const result = await clearZeroTokens();
    return res.json(result.delete_closet_tokens);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
};

app.post('/caching/clear', checkApiKey, clearZeroTokensEndpoint);
