import { PowerSyncContext } from '@powersync/react-native';
import React, { useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';
import { SupabaseConnector } from './Connector';
import { db as powerSync } from './PowerSync';


type Props = {
  children: React.ReactNode;
};

export function DatabaseProvider({
  children,
}: Props) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log(
  'Access token:',
  session?.access_token
);

        if (!session) {
          console.log('No authenticated user');
          return;
        }

        console.log('1. Starting PowerSync connection');

        const connector = new SupabaseConnector(supabase);

        console.log('2. Calling powerSync.connect()');

        await powerSync.connect(connector);

        console.log('3. PowerSync connect completed');

        if (mounted) {
          setConnected(true);
        }

        console.log('PowerSync connected');
      } catch (error) {
        console.error(
          'PowerSync connection failed:',
          error
        );
      }
    };

    connect();

    return () => {
      mounted = false;
      //powerSync.disconnect();
    };
  }, []);

  useEffect(() => {

 const listener = powerSync.registerListener({
  statusChanged: (status) => {
    console.log(
      '========== POWER SYNC STATUS =========='
    );

    console.log(
      JSON.stringify(status, null, 2)
    );

    console.log(
      '========================================'
    );
  },
});

  return () => {
    listener?.();
  };

}, []);

  return (
    <PowerSyncContext.Provider value={powerSync as any}>
      {children}
    </PowerSyncContext.Provider>
  );
}