import { Connector } from './connector';
import { db } from './database';

export async function initializePowerSync() {
  const connector = new Connector();

  await db.connect(connector);
}