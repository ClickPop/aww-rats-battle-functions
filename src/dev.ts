import { PORT } from './config/env';
import { app } from './lib/express';
import './index';

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
