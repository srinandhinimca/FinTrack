import React, { useEffect, useState } from 'react';
import { PowerSyncContext } from '@powersync/react-native';

import { db as powerSync } from './PowerSync';
import { SupabaseConnector } from './Connector';
import { supabase } from '../lib/supabase';


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
        const connector = new SupabaseConnector(supabase);

        await powerSync.connect(connector);

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
      powerSync.disconnect();
    };
  }, []);

  return (
    <PowerSyncContext.Provider value={powerSync as any}>
      {children}
    </PowerSyncContext.Provider>
  );
}