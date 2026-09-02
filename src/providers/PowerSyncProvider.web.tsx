import React from 'react';

type Props = {
  children: React.ReactNode;
};

export function PowerSyncProvider({ children }: Props) {
  return <>{children}</>;
}