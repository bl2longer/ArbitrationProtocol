import { FC, ReactNode } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

export const ChildTooltip: FC<{
  title: string;
  tooltip: string;
  children: ReactNode;
}> = ({ children, title, tooltip }) => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-96">
        <p className="text-base text-primary font-bold">{title}</p>
        <p className="text-sm font-normal text-justify">{tooltip}</p>
      </HoverCardContent>
    </HoverCard>
  )
}