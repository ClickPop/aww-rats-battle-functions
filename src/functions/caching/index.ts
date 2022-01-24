import { sdk } from '../../lib/graphql';
import { app } from '../../lib/express';
import {
  HasuraActionHandler,
  Rats_Insert_Input,
  Closet_Pieces_Insert_Input,
  Closet_Tokens_Insert_Input,
  CombinedCacheMutation,
  ClearZeroTokensMutation,
} from '../../types';
import { checkApiKey } from '../../middleware/checkApiKey';

const { combinedCache, clearZeroTokens } = sdk;

const cacheEndpoint: HasuraActionHandler<
  | {
      cache: CombinedCacheMutation;
    }
  | { error: unknown },
  {
    rats: Rats_Insert_Input[];
    closet_pieces: Closet_Pieces_Insert_Input[];
    closet_tokens: Closet_Tokens_Insert_Input[];
  }
> = async (req, res) => {
  const { rats, closet_pieces, closet_tokens } = req.body;
  try {
    const cache = await combinedCache({
      rats,
      pieces: closet_pieces,
      tokens: closet_tokens,
    });
    return res.json({
      cache,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
};

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

app.post('/caching', checkApiKey, cacheEndpoint);
app.post('/caching/clear', checkApiKey, clearZeroTokensEndpoint);
