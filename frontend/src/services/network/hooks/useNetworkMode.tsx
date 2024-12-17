import { useWalletContext } from "@/contexts/WalletContext/WalletContext";

export const useNetworkMode = () => {
  const { networkMode } = useWalletContext();

  return {
    isMainnet: networkMode === "mainnet"
  }
}