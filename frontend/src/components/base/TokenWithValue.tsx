
import { TokenOrNative } from "@/services/tokens/token-or-native";
import { formatBigNumber } from "@/utils/formatBigNumber";
import BigNumber from "bignumber.js";
import { FC } from "react";
import { TokenIcon } from "./TokenIcon";

export const TokenWithValue: FC<{
  amount: BigNumber | number;
  token: TokenOrNative;
  decimals?: number;
  hideTokenLogo?: boolean;
  placeholder?: string;
}> = ({ amount, token, decimals = 2, hideTokenLogo = false, placeholder = "" }) => {

  if (amount === undefined || token === undefined)
    return <span>{placeholder}</span>;

  return (
    <div className="flex flex-row items-center">
      {!hideTokenLogo && <TokenIcon style={{ marginRight: "6px", height: 14 }} token={token} />}
      {formatBigNumber(amount, decimals)}
      <span style={{ marginLeft: 5 }}>{token.symbol}</span>
    </div>
  )
}