import { FC } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { InfoIcon } from "lucide-react";

export const IconTooltip: FC<{
  iconClassName?: string;
  iconSize?: number;
  tooltip: string;
}> = ({ iconClassName, iconSize = 12, tooltip }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <InfoIcon size={iconSize} className={iconClassName} />
        </TooltipTrigger>
        <TooltipContent>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}