import { FC, ReactNode } from "react";

export const ModalBaseHeader: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="todo">
      {children}
    </div>
  );
};