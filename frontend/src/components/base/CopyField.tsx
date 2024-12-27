import { useCopyText } from "@/services/ui/hooks/useCopyText";
import { CopyIcon } from "lucide-react";
import { FC } from "react";
import { Button } from "../ui/button";

export const CopyField: FC<{
  value: string;
}> = (props) => {
  const { value } = props;
  const { copyText } = useCopyText();

  return (
    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); void copyText(value); }}>
      <CopyIcon />
    </Button>
  );
};
