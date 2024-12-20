import { Button } from "@/components/ui/button";
import { useEVMContext } from "@/contexts/EVMContext/EVMContext";
import { useWalletContext } from "@/contexts/WalletContext/WalletContext";
import { formatAddress } from "@/utils/formatAddress";

export const WrongNetwork = () => {
  const { connect } = useEVMContext();
  const { evmAccount } = useWalletContext();

  if (!evmAccount)
    return null;

  return (
    <Button onClick={connect} size="sm">
      Wrong Network {formatAddress(evmAccount, [5, 4])}
    </Button>
  );
};
