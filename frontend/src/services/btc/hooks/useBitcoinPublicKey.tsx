import { useContext, useEffect, useState } from "react";
import { useBitcoinWalletAction } from "./useBitcoinWalletAction";
import { useWalletContext } from "@/contexts/WalletContext/WalletContext";

/**
 * Returns the public key of the currently active bitcoin account.
 */
export const useBitcoinPublicKey = (): string => {
  const { bitcoinAccount } = useWalletContext();
  const { getPublicKey } = useBitcoinWalletAction();
  const [publicKey, setPublicKey] = useState<string>(undefined);

  useEffect(() => {
    if (bitcoinAccount) {
      getPublicKey().then(key => setPublicKey(key)).catch(() => setPublicKey(undefined));
    }
    else {
      setPublicKey(undefined);
    }
  }, [bitcoinAccount, getPublicKey])

  return publicKey;
}