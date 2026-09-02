import { PowerSyncContext } from '@powersync/react-native';
import React, { useEffect, useRef } from 'react';

import { supabase } from '../lib/supabase';
import { Connector } from '../powersync/connector';
import { db } from '../powersync/database';

type Props = {
  children: React.ReactNode;
};

export function PowerSyncProvider({ children }: Props) {
  const connected = useRef(false);

  useEffect(() => {
    const connectPowerSync = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || connected.current) {
        return;
      }

      try {
        const connector = new Connector();

        await db.connect(connector);

        connected.current = true;

        console.log('PowerSync connected');
      } catch (error) {
        console.error('PowerSync connection failed:', error);
      }
    };

    connectPowerSync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === 'SIGNED_IN') {
        connectPowerSync();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <PowerSyncContext.Provider value={db}>
      {children}
    </PowerSyncContext.Provider>
  );
}