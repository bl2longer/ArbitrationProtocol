import { FC, ReactNode } from "react";

/**
 * Horiontal stack for page title + optional right side action buttons / filters
 */
export const PageTitleRow: FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 ${className}`}>{children}</div>
  )
}

