import { useCallback } from "react";
import { useErrorHandler } from "./ErrorHandlerContext";

export const useRunAndHandleError = () => {
  const { handleError } = useErrorHandler();

  const runAndHandle = useCallback(<T>(handler: () => Promise<T>, userFeeback = true): Promise<T> => {
    return new Promise(resolve => {
      handler().then(res => resolve(res)).catch(e => {
        userFeeback && handleError(e);

        resolve(null);
      })
    });
  }, [handleError]);

  return runAndHandle;
}