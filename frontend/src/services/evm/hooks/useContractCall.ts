import { useErrorHandler } from "@/contexts/ErrorHandlerContext";
import { wagmiConfig } from "@/contexts/EVMContext/EVMContext";
import { writeContract as wagmiWriteContract, waitForTransactionReceipt, WaitForTransactionReceiptReturnType } from '@wagmi/core';
import { Abi } from "abitype";
import { useCallback, useState } from "react";
import { Address } from "viem";

export type WriteContractParams = {
  contractAddress: string;
  abi: Abi | readonly unknown[];
  functionName: string;
  args: unknown[];
  value?: bigint;
}

export const useContractCall = () => {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error>(null);
  const { handleError } = useErrorHandler();

  const writeContract = useCallback(async (params: WriteContractParams, waitForReceipt = true): Promise<{ hash: string, receipt?: WaitForTransactionReceiptReturnType }> => {
    setIsPending(true);

    let _hash: `0x${string}`;
    try {
      _hash = await wagmiWriteContract(wagmiConfig, {
        address: params.contractAddress as Address,
        abi: params.abi,
        functionName: params.functionName,
        args: params.args,
        value: params.value as undefined,
        chain: null,
        account: null
      });
    } catch (e) {
      handleError(e);
      setIsPending(false);
      setIsSuccess(false);
      return { hash: null };
    }

    console.log("_hash", _hash);

    if (!_hash) {
      setIsPending(false);
      setIsSuccess(false);
      setError(new Error("Transaction failed")); // TODO
      return { hash: _hash };
    }

    if (waitForReceipt) {
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: _hash });
      console.log("receipt", receipt);

      setIsPending(false);
      setIsSuccess(!!receipt.status);
      // TODO: ERROR

      return { hash: _hash, receipt };
    }
    else {
      setIsPending(false);
      setIsSuccess(!!_hash);
      return { hash: _hash };
    }
  }, [handleError]);

  return { writeContract, isPending, isSuccess, error };
}