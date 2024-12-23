import { useSnackbar } from "notistack";

const SuccessToastDurationMs = 2000;
const ErrorToastDurationMs = 4000;

export const useToasts = () => {
  const { enqueueSnackbar } = useSnackbar();

  return {
    successToast: (message: string) => enqueueSnackbar(message, { variant: "success", autoHideDuration: SuccessToastDurationMs }),
    errorToast: (message: string) => enqueueSnackbar(message, { variant: "error", autoHideDuration: ErrorToastDurationMs })
  }
}