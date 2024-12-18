import { FC, ReactNode } from "react";

export const ModalRootCard: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[95%] flex flex-col max-h-[95vh]">
      {children}
    </div>
  );
};