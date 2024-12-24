import { FC, ReactNode } from "react";

export const BoxTitle: FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <h1 className={`text-xl font-bold ${className}`}>{children}</h1>
  )
}