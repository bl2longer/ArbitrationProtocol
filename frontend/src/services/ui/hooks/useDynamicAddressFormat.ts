import { formatAddress } from "@/utils/formatAddress";
import { useCallback } from "react";
import { useScreenSize } from "./useScreenSize";

/**
 * Adjusts an address to fit the current screen size.
 */
export const useDynamicAddressFormat = () => {
  const { isSmallDevice } = useScreenSize();

  const dynamicAddressFormat = useCallback((address: string): string => {
    if (isSmallDevice)
      return formatAddress(address, [12, 12]);
    else
      return address;
  }, [isSmallDevice]);

  return { dynamicAddressFormat };
}