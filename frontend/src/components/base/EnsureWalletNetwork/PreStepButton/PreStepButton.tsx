import { buttonVariants } from "@/components/ui/button";
import { FC } from "react";

/**
 * Button that shows 2 smaller lines to indicate user that there is a step to complete
 * before accessing the real feature. For example, connect wallet before accessing place order.
 */
export const PreStepButton: FC<{
  title: string;
  continuesTo: string;
  onClick: () => void;
  fullWidth?: boolean;
}> = ({ title, continuesTo, onClick, fullWidth = false }) => {
  return (
    <>
      <div onClick={onClick} className={`${buttonVariants()} ${fullWidth && "w-full"}`}>
        <div className="flex flex-col items-center">
          <div className="text-xs">{continuesTo}</div>
          <div className="font-bold text-sm">{title}</div>
        </div>
      </div>
    </>
  )
}