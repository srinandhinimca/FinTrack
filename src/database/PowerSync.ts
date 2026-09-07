import { PowerSyncDatabase } from '@powersync/react-native';
import { AppSchema } from './AppSchema';

export const db = new PowerSyncDatabase({
  schema: AppSchema as any,
  database: {
    dbFilename: 'fintrack.db',
  },
});