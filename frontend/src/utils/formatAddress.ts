import { isNullOrUndefined } from "./isNullOrUndefined";

export const formatAddress = (text: string, keep: [number, number] = [6, 4]) => {
  const [head, tail] = keep;

  if (isNullOrUndefined(text))
    return undefined;

  return text.length > head + tail
    ? text.replace(text.substring(head, text.length - tail), "...")
    : text;
};
