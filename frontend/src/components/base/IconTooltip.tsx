import { cn } from "@/utils/shadcn";
import { InfoIcon } from "lucide-react";
import { FC } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

export const IconTooltip: FC<{
  iconClassName?: string;
  iconSize?: number;
  title: string;
  tooltip: string;
}> = ({ iconClassName, iconSize = 12, title, tooltip }) => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <InfoIcon size={iconSize} className={cn("cursor-help", iconClassName)} />
      </HoverCardTrigger>
      <HoverCardContent className="w-96">
        <p className="text-base text-primary font-bold">{title}</p>
        <p className="text-sm font-normal text-justify">{tooltip}</p>
      </HoverCardContent>
    </HoverCard>
  )
}