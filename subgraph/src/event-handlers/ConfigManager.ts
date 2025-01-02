import { BigInt } from "@graphprotocol/graph-ts";
import { ConfigUpdated, Initialized } from "../../generated/ConfigManager/ConfigManager";
import { ConfigEntry } from "../../generated/schema";

export function handleInitialized(event: Initialized): void {
  setConfigEntryValue("MIN_STAKE", new BigInt(1).times(BigInt.fromI32(10).pow(18))); // 1 ether
  setConfigEntryValue("MAX_STAKE", new BigInt(100).times(BigInt.fromI32(10).pow(18))); // 100 ether
  setConfigEntryValue("MIN_STAKE_LOCKED_TIME", BigInt.fromI32(7 * 24 * 60 * 60)); // 7 days
  setConfigEntryValue("MIN_TRANSACTION_DURATION", BigInt.fromI32(24 * 60 * 60)); // 1 day
  setConfigEntryValue("MAX_TRANSACTION_DURATION", BigInt.fromI32(30 * 24 * 60 * 60)); // 30 days
  setConfigEntryValue("TRANSACTION_MIN_FEE_RATE", BigInt.fromI32(100)); // 1% in basis points
  setConfigEntryValue("ARBITRATION_TIMEOUT", BigInt.fromI32(24 * 60 * 60)); // 24 hours
  setConfigEntryValue("ARBITRATION_FROZEN_PERIOD", BigInt.fromI32(30 * 60)); // 30 minutes
  setConfigEntryValue("SYSTEM_FEE_RATE", BigInt.fromI32(500)); // 5% in basis points
  setConfigEntryValue("SYSTEM_COMPENSATION_FEE_RATE", BigInt.fromI32(200)); // 2% in basis points
}

export function handleConfigUpdated(event: ConfigUpdated): void {
  const configEntry = getConfigEntry(event.params.key.toString());
  configEntry.value = event.params.newValue;
  configEntry.save();
}

function setConfigEntryValue(key: string, value: BigInt): void {
  const configEntry = getConfigEntry(key);
  configEntry.value = value;
  configEntry.save();
}

/**
 * Gets the existing config entry if any, otherwise creates a new one.
 */
export function getConfigEntry(id: string): ConfigEntry {
  let existingConfigEntry = ConfigEntry.load(id);

  if (existingConfigEntry)
    return existingConfigEntry;

  const configEntry = new ConfigEntry(id);
  configEntry.key = id;

  return configEntry;
}