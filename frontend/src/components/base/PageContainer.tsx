import { FC, ReactNode } from "react";

export const PageContainer: FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col gap-4 container mx-auto px-4 py-8 ${className}`}>{children}</div>
  )
}