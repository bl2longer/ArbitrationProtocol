import BigNumber from "bignumber.js";

/**
 * Formats the bignumber to have maxDecimals decimals, but without 0 padding for shorter numbers.
 * eg :
 * - formatBigNumber(0.1234567, 5) -> 0.12345
 * - formatBigNumber(0.1, 5) -> 0.1
 */
export const formatBigNumber = (bn: BigNumber, maxDecimals: number): string => {
  return new BigNumber(bn.toFixed(maxDecimals)).toPrecision();
}