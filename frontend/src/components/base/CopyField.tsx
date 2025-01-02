import { useCopyText } from "@/services/ui/hooks/useCopyText";
import { cn } from "@/utils/shadcn";
import { CopyIcon } from "lucide-react";
import { FC } from "react";
import { Button } from "../ui/button";

export const CopyField: FC<{
  value: string;
  padding?: boolean;
}> = ({ value, padding = true }) => {
  const { copyText } = useCopyText();

  return (
    <Button variant="ghost" className={cn(!padding && "w-5 h-5")} size="icon" onClick={(e) => { e.stopPropagation(); void copyText(value); }}>
      <CopyIcon />
    </Button>
  );
};
