import { FC } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/utils/shadcn";

const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
] as const

/**
 * Combo box that lets user select multiple string values.
 * 
 * TODO: IMPLEMENTATION IN PROGRESS, NOT WORKING
 */
export const MultiStringSelector: FC<{
  title: string;
  choices: string[];
  currentSelection: string[];
  onChange: (newSelection: string[]) => void;
}> = ({ title, choices, currentSelection, onChange }) => {
  return <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        className={cn(
          "w-[200px] justify-between",
          /* !field.value && "text-muted-foreground" */
        )}
      >
        {title}
        <ChevronsUpDown className="opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[200px] p-0">
      <Command>
        {/* <CommandInput placeholder="Search framework..." className="h-9" /> */}
        <CommandList>
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {languages.map((language) => (
              <CommandItem
                value={language.label}
                key={language.value}
                onSelect={() => {
                  //form.setValue("language", language.value)
                }}
              >
                {language.label}
                <Check
                  className={cn(
                    "ml-auto",
                    /* language.value === field.value
                      ? "opacity-100"
                      : "opacity-0" */
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
}