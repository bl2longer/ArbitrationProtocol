import { cn } from "@/utils/shadcn";
import React, { FC, HTMLAttributes, ReactNode } from "react";

export const WalletRow: FC<{ disabled?: boolean } & HTMLAttributes<HTMLDivElement>> = ({ disabled, children, ...props }) => {
  return (
    <div {...props} className={cn("flex items-center justify-start bg-primary/[0.2] gap-4 border border-solid border-white/[0.2] px-5 py-3 rounded-3xl transition-all duration-300 ease-in-out cursor-pointer", !disabled && "hover:bg-primary/[0.1]")}>
      {children}
    </div>
  );
};