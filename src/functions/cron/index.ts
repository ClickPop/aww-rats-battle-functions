import { sdk } from '../../lib/graphql';
import { app } from '../../lib/express';
import { HasuraActionHandler, ResetEnergyMutation } from '../../types';
import { checkApiKey } from '../../middleware/checkApiKey';

const { resetEnergy } = sdk;

const resetEnergyEndpint: HasuraActionHandler<
  ResetEnergyMutation['reset_energy'] | { error: unknown }
> = async (_, res) => {
  try {
    const result = await resetEnergy();
    return res.json(result.reset_energy);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
};

app.post('/cron/reset-energy', checkApiKey, resetEnergyEndpint);
