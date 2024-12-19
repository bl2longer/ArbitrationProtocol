import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { FC } from "react";
import { Input } from "../ui/input";

export const SearchInput: FC<{
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ placeholder, value, onChange, className }) => {
  return (
    <div className="relative flex-grow sm:flex-grow-0">
      <Input
        type="text"
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2 border ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
  )
}