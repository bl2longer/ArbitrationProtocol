import { FC } from "react";
import { TokenIcon } from "./TokenIcon";
import { TokenOrNative } from "@/services/tokens/token-or-native";

export const TokenIconAndSymbol: FC<{
  token: TokenOrNative;
  selected?: boolean;
  margin?: number;
}> = ({ token, margin = 5 }) => {

  if (!token)
    return null;

  return (
    <div className="flex flex-row items-center">
      <TokenIcon token={token} style={{ height: 20, marginRight: margin }} />
      <div>{token.symbol}</div>
    </div>
  )
}