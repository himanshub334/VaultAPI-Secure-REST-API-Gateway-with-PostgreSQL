import { config } from './config';
import { app } from './app';

app.listen(config.port, () => {
  console.log(`VaultAPI listening on port ${config.port}`);
});
