import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

export const useResetFormOnOpen = (isOpen: boolean, form: UseFormReturn) => {
  useEffect(() => {
    if (isOpen)
      form.reset();
  }, [isOpen, form]);
}