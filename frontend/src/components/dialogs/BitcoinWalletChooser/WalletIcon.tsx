import { FC } from "react";

export const WalletIcon: FC<React.ComponentPropsWithoutRef<"img">> = (props) => {
  return <img className="w-10 h-10 bg-light-gray rounded-full self-center" {...props} />
}