import { FC } from "react";

export const WalletIcon: FC<React.ComponentPropsWithoutRef<"img">> = (props) => {
  return <img className="w-50 h-50 bg-light-gray p-5 rounded-full self-center" {...props} />
}