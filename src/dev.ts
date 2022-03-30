import { app } from './index';
import { PORT } from './config/env';

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
