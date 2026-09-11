import { SupabaseConnector } from "./connector";
import { db } from "./database";

const connector = new SupabaseConnector();

let isConnected = false;

export async function connectPowerSync(): Promise<void> {
  if (isConnected) {
    console.log("PowerSync already connected");
    return;
  }

  console.log("PowerSync: connecting...");

  try {
    await db.connect(connector);

    isConnected = true;

    console.log("PowerSync: CONNECTED successfully");
  } catch (error) {
    console.error("PowerSync: CONNECTION FAILED", error);
    throw error;
  }
}

export async function disconnectPowerSync(): Promise<void> {
  if (!isConnected) {
    return;
  }

  console.log("PowerSync: disconnecting...");

  await db.disconnect();

  isConnected = false;

  console.log("PowerSync: DISCONNECTED");
}

export { db };
