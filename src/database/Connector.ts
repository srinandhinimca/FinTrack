import {
  PowerSyncBackendConnector,
  UpdateType,
} from '@powersync/react-native';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseConnector implements PowerSyncBackendConnector {
  constructor(
    private supabase: SupabaseClient
  ) {}

  async fetchCredentials() {

      console.log(
    '========== fetchCredentials CALLED =========='
  );

    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession();

   console.log(
    'Session exists:',
    !!session
  );

  console.log(
    'Access token exists:',
    !!session?.access_token
  );

   
  if (error) {
    console.error(
      'Supabase getSession error:',
      JSON.stringify(error, null, 2)
    );
    throw error;
  }

    if (!session) {
      throw new Error('User is not authenticated');
    }

    const endpoint = process.env.EXPO_PUBLIC_POWERSYNC_URL;

     console.log('PowerSync endpoint:', endpoint);

    if (!endpoint) {
      throw new Error('PowerSync endpoint is not configured');
    }

    console.log('4. fetchCredentials called');
console.log('5. Session exists:', !!session);
console.log('6. Endpoint:', endpoint);
    return {
      endpoint,
      token: session.access_token,
    };
  }

  async uploadData(
  database: Parameters<
    PowerSyncBackendConnector['uploadData']
  >[0]
) {
  console.log('================================');
  console.log('PowerSync uploadData() START');
  console.log('================================');

  try {
    console.log('Getting next CRUD transaction...');

    const transaction =
      await database.getNextCrudTransaction();

    console.log(
      'Transaction:',
      transaction ? 'FOUND' : 'NONE'
    );

    if (!transaction) {
      console.log('No pending CRUD transaction');
      return;
    }

    console.log(
      'CRUD count:',
      transaction.crud.length
    );

    for (const op of transaction.crud) {

      console.log('------------------------------');
      console.log('Operation:', op.op);
      console.log('Table:', op.table);
      console.log('ID:', op.id);
      console.log(
        'Data:',
        JSON.stringify(op.opData, null, 2)
      );

      if (op.op === UpdateType.PUT) {

        console.log('Starting Supabase UPSERT...');

        const payload = {
          id: op.id,
          ...op.opData,
        };

        console.log(
          'UPSERT payload:',
          JSON.stringify(payload, null, 2)
        );

        const result = await this.supabase
          .from(op.table)
          .upsert(payload);

        console.log(
          'Supabase result received'
        );

        if (result.error) {

          console.log(
            'SUPABASE ERROR CODE:',
            result.error.code
          );

          console.log(
            'SUPABASE ERROR MESSAGE:',
            result.error.message
          );

          console.log(
            'SUPABASE ERROR DETAILS:',
            result.error.details
          );

          console.log(
            'SUPABASE ERROR HINT:',
            result.error.hint
          );

          throw new Error(
            `Supabase ${result.error.code}: ${result.error.message}`
          );
        }

        console.log(
          'Supabase UPSERT SUCCESS'
        );
      }

      else if (op.op === UpdateType.PATCH) {

        console.log('Starting Supabase UPDATE...');

        const result = await this.supabase
          .from(op.table)
          .update(op.opData ?? {})
          .eq('id', op.id);

        if (result.error) {

          console.log(
            'SUPABASE UPDATE ERROR CODE:',
            result.error.code
          );

          console.log(
            'SUPABASE UPDATE ERROR:',
            result.error.message
          );

          throw new Error(
            `Supabase ${result.error.code}: ${result.error.message}`
          );
        }

        console.log(
          'Supabase UPDATE SUCCESS'
        );
      }

      else if (op.op === UpdateType.DELETE) {

        console.log('Starting Supabase DELETE...');

        const result = await this.supabase
          .from(op.table)
          .delete()
          .eq('id', op.id);

        if (result.error) {

          console.log(
            'SUPABASE DELETE ERROR CODE:',
            result.error.code
          );

          console.log(
            'SUPABASE DELETE ERROR:',
            result.error.message
          );

          throw new Error(
            `Supabase ${result.error.code}: ${result.error.message}`
          );
        }

        console.log(
          'Supabase DELETE SUCCESS'
        );
      }
    }

    console.log(
      'Completing PowerSync transaction...'
    );

    await transaction.complete();

    console.log(
      '================================'
    );

    console.log(
      'PowerSync upload SUCCESS'
    );

    console.log(
      '================================'
    );

  } catch (error) {

    console.log(
      '================================'
    );

    console.log(
      'PowerSync uploadData() ERROR'
    );

    console.log(
      'Error type:',
      typeof error
    );

    console.log(
      'Error:',
      error instanceof Error
        ? error.message
        : String(error)
    );

    console.log(
      'Stack:',
      error instanceof Error
        ? error.stack
        : 'No stack'
    );

    console.log(
      '================================'
    );

    throw error;
  }
}
}