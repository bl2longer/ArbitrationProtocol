import { BigInt, Bytes } from "@graphprotocol/graph-ts";

export let ZERO_ADDRESS = '0x' + '0'.repeat(40);
export let BIGINT_ZERO = BigInt.fromI32(0);
export let BYTES32_ZERO = Bytes.fromHexString("0x" + "0".repeat(64));
