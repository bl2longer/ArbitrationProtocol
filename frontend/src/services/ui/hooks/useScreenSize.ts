import { useMediaQuery } from "usehooks-ts";

/**
 * Tells if the current screen is xs, sm, etc.
 * Used to Render different components according to current screen size.
 */
export const useScreenSize = () => {
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  const isMediumDevice = useMediaQuery("only screen and (min-width : 769px) and (max-width : 992px)");
  const isLargeDevice = useMediaQuery("only screen and (min-width : 993px) and (max-width : 1200px)");
  const isExtraLargeDevice = useMediaQuery("only screen and (min-width : 1201px)");

  return { isSmallDevice, isMediumDevice, isLargeDevice, isExtraLargeDevice };
}