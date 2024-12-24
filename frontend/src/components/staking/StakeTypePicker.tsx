import { FC, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/utils/shadcn";
import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";

export type StakeType = "coin" | "nft" | "unstake";

export const StakeTypePicker: FC<{
  canUnstake?: boolean;
  value: StakeType;
  className?: string;
  onChange: (value: StakeType) => void;
}> = ({ value, onChange, canUnstake = false, className }) => {
  const activeChain = useActiveEVMChainConfig();

  const stakeTypes: { value: StakeType, label: string }[] = useMemo(() => {
    const types: { value: StakeType, label: string }[] = [
      {
        value: "coin",
        label: `Stake ${activeChain?.nativeCurrency.symbol}`,
      },
      {
        value: "nft",
        label: "Stake NFT",
      }
    ];

    if (canUnstake) {
      types.push({
        value: "unstake",
        label: "Withdraw everything",
      });
    }

    return types;
  }, []);

  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value
            ? stakeTypes.find((framework) => framework.value === value)?.label
            : "Select Stake Type"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {stakeTypes.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue as StakeType);
                    setOpen(false);
                  }}
                >
                  {framework.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === framework.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}