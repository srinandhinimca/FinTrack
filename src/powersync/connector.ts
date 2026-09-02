import {
    type CommonPowerSyncDatabase,
    type PowerSyncBackendConnector,
    UpdateType,
} from '@powersync/react-native';

import { supabase } from '../lib/supabase';

export class Connector implements PowerSyncBackendConnector {
  /**
   * Get the current Supabase user's access token
   * and provide the PowerSync URL.
   */
  async fetchCredentials() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    const session = data.session;

    if (!session) {
      throw new Error('No authenticated Supabase session found.');
    }

    const powersyncUrl = process.env.EXPO_PUBLIC_POWERSYNC_URL;

    if (!powersyncUrl) {
      throw new Error(
        'EXPO_PUBLIC_POWERSYNC_URL is not configured.'
      );
    }

    return {
      endpoint: powersyncUrl,
      token: session.access_token,
    };
  }

  /**
   * Upload local PowerSync changes to Supabase.
   */
  async uploadData(database: CommonPowerSyncDatabase) {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    try {
      for (const op of transaction.crud) {
        const record = {
          ...op.opData,
          id: op.id,
        };

        switch (op.op) {
          case UpdateType.PUT: {
            const { error } = await supabase
              .from(op.table)
              .upsert(record);

            if (error) {
              throw error;
            }

            break;
          }

          case UpdateType.PATCH: {
            const { error } = await supabase
              .from(op.table)
              .update(op.opData)
              .eq('id', op.id);

            if (error) {
              throw error;
            }

            break;
          }

          case UpdateType.DELETE: {
            const { error } = await supabase
              .from(op.table)
              .delete()
              .eq('id', op.id);

            if (error) {
              throw error;
            }

            break;
          }
        }
      }

      await transaction.complete();
    } catch (error) {
      console.error('PowerSync upload failed:', error);
      throw error;
    }
  }
}