import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { FC } from "react";

export const SearchInput: FC<{
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ placeholder, value, onChange, className }) => {
  return (
    <div className="relative flex-grow sm:flex-grow-0">
      <input
        type="text"
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
  )
}