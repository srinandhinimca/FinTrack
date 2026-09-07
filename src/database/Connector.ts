import { SupabaseClient } from '@supabase/supabase-js';
import {
  PowerSyncBackendConnector,
  UpdateType,
} from '@powersync/react-native';

export class SupabaseConnector implements PowerSyncBackendConnector {

  constructor(
    private supabase: SupabaseClient
  ) {}

  async fetchCredentials() {

    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session) {
      throw new Error('User is not authenticated');
    }

    const endpoint = process.env.EXPO_PUBLIC_POWERSYNC_URL;

    if (!endpoint) {
      throw new Error('PowerSync endpoint is not configured');
    }

    return {
      endpoint,
      token: session.access_token,
    };
  }

  async uploadData(
    database: Parameters<PowerSyncBackendConnector['uploadData']>[0]
  ) {
    const transaction =
      await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    try {
      for (const op of transaction.crud) {

        if (op.op === UpdateType.PUT) {

          await this.supabase
            .from(op.table)
            .upsert({
              id: op.id,
              ...op.opData,
            });

        } else if (op.op === UpdateType.PATCH) {

          await this.supabase
            .from(op.table)
            .update(op.opData ?? {})
            .eq('id', op.id);

        } else if (op.op === UpdateType.DELETE) {

          await this.supabase
            .from(op.table)
            .delete()
            .eq('id', op.id);
        }
      }

      await transaction.complete();

    } catch (error) {
      console.error(
        'PowerSync upload failed:',
        error
      );

      throw error;
    }
  }
}