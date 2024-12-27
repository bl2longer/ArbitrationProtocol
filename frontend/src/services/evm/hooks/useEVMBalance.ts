import { useWalletContext } from "@/contexts/WalletContext/WalletContext";
import { tokenToReadableValue } from "@/services/tokens/tokens";
import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { useBalance } from "wagmi";

/**
 * Returns the number of native coins owned by the active EVM account.
 * Readable format for display
 */
export const useEVMBalance = () => {
  const { evmAccount } = useWalletContext();
  const { data } = useBalance({ address: evmAccount as Address, query: { refetchInterval: 10000 } });
  const [balance, setBalance] = useState<BigNumber>(undefined);

  useEffect(() => {
    setBalance(tokenToReadableValue(data?.value, 18));
  }, [data]);

  return { balance };
}