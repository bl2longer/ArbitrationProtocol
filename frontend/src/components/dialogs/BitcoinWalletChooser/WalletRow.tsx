import React, { FC, HTMLAttributes, ReactNode } from "react";

export const WalletRow: FC<HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
  return (
    <div {...props} className="flex items-center justify-start gap-10 border border-solid border-white/[0.2] p-5 mb-10 rounded-3xl transition-all duration-300 ease-in-out cursor-pointer hover:bg-white/[0.1]">
      {children}
    </div>
  );
};