import EssentialsWallet from "@/assets/wallets/essentials.svg";
import OkxWallet from "@/assets/wallets/okx.svg";
import UnisatWallet from "@/assets/wallets/unisat.svg";
import { Web3ProviderProps } from "@/contexts/WalletContext/WalletContext";
import { FC, createContext, memo, useCallback, useMemo, useState } from "react";
// import { WalletIcon, WalletRow } from "./BitcoinWalletChooser.styles";
import { useOkxWallet } from "@/services/btc/hooks/useOkxWallet";
import { useUnisatWallet } from "@/services/btc/hooks/useUnisatWallet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WalletRow } from "./WalletRow";
import { WalletIcon } from "./WalletIcon";
import { DialogProps } from "@radix-ui/react-dialog";

/**
 * Modal to let user choose his bitcoin wallet
 */
export const BitcoinWalletChooserModal: FC<Omit<DialogProps, "children"> & {
  onHandleClose: () => void;
}> = (props) => {
  const { onHandleClose, ...rest } = props;
  const { connectWallet: connectUnisat } = useUnisatWallet();
  const { connectWallet: connectOkx } = useOkxWallet();

  const isInsideEssentials = useMemo(() => {
    return window.unisat?.isEssentials || window.okxwallet?.bitcoin?.isEssentials;
  }, []);

  const handleConnectUnisat = useCallback(async () => {
    if (await connectUnisat())
      onHandleClose();
  }, [connectUnisat, onHandleClose]);

  const handleConnectOKX = useCallback(async () => {
    if (await connectOkx())
      onHandleClose();
  }, [connectOkx, onHandleClose]);

  return (
    <Dialog {...rest} onOpenChange={onHandleClose}>
      <DialogContent>
        {/* Header */}
        <DialogHeader /* onClose={() => onHandleClose()}  */>
          <DialogTitle>Pick a Bitcoin Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred Bitcoin wallet to connect to the Arbitration Protocol.
          </DialogDescription>
        </DialogHeader>

        {/* Main form */}
        <div> {/* MainContentStack */}
          <div className="flex flex-col gap-2">
            {isInsideEssentials &&
              <WalletRow onClick={handleConnectUnisat}>
                <WalletIcon src={EssentialsWallet} />
                Essentials
              </WalletRow>
            }
            <WalletRow disabled={!window.unisat} onClick={handleConnectUnisat} style={{ opacity: (window.unisat ? 1 : 0.3) }}>
              <WalletIcon src={UnisatWallet} />
              Unisat Wallet
            </WalletRow>
            <WalletRow disabled={!window.okxwallet} onClick={handleConnectOKX} style={{ opacity: (window.okxwallet ? 1 : 0.3) }}>
              <WalletIcon src={OkxWallet} />
              OKX Wallet
            </WalletRow>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button
            /* fullWidth
            size="large"
            variant="outlined" */
            onClick={onHandleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const BitcoinWalletChooserProvider = memo(({ children }: Web3ProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const promptBitcoinWallet = () => {
    setIsOpen(true);
  }

  return (
    <BitcoinWalletChooserContext.Provider value={{ promptBitcoinWallet }}>
      {children}
      <BitcoinWalletChooserModal open={isOpen} onHandleClose={() => setIsOpen(false)} />
    </BitcoinWalletChooserContext.Provider>
  );
});

type BitcoinWalletChooserProps = {
  promptBitcoinWallet: () => void;
}

export const BitcoinWalletChooserContext = createContext<BitcoinWalletChooserProps>(null);