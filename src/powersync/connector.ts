import {
    CommonPowerSyncDatabase,
    PowerSyncBackendConnector,
    PowerSyncCredentials,
    UpdateType,
} from '@powersync/react-native';

import { supabase } from '../lib/supabase';

const powerSyncUrl = process.env.EXPO_PUBLIC_POWERSYNC_URL;

if (!powerSyncUrl) {
  throw new Error('Missing EXPO_PUBLIC_POWERSYNC_URL');
}

const FATAL_RESPONSE_CODES = [
  /^22...$/,
  /^23...$/,
  /^42501$/,
];

export class SupabaseConnector implements PowerSyncBackendConnector {
  async fetchCredentials(): Promise<PowerSyncCredentials> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (!session) {
      throw new Error(
        'No active Supabase session. User must be signed in before PowerSync connects.'
      );
    }

    return {
      endpoint: powerSyncUrl,
      token: session.access_token,
    };
  }

  async uploadData(database: CommonPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    let lastOperation: {
      op: string;
      table: string;
      id: string;
    } | null = null;

    try {
      for (const op of transaction.crud) {
        lastOperation = {
          op: op.op,
          table: op.table,
          id: op.id,
        };

        const table = supabase.from(op.table);

        let result;

        switch (op.op) {
          case UpdateType.PUT: {
            const record = {
              ...(op.opData ?? {}),
              id: op.id,
            };

            result = await table.upsert(record);
            break;
          }

          case UpdateType.PATCH: {
            if (!op.opData) {
              continue;
            }

            result = await table
              .update(op.opData)
              .eq('id', op.id);

            break;
          }

          case UpdateType.DELETE: {
            result = await table
              .delete()
              .eq('id', op.id);

            break;
          }

          default:
            continue;
        }

        if (result.error) {
          throw result.error;
        }
      }

      await transaction.complete();
    } catch (error: any) {
      console.error(
        'PowerSync upload failed:',
        lastOperation,
        error
      );

      if (
        typeof error?.code === 'string' &&
        FATAL_RESPONSE_CODES.some((regex) =>
          regex.test(error.code)
        )
      ) {
        console.error(
          'Fatal PowerSync upload error. Completing transaction:',
          lastOperation
        );

        await transaction.complete();
        return;
      }

      throw error;
    }
  }
}