import { useActiveEVMChainConfig } from "@/services/chains/hooks/useActiveEVMChainConfig";
import { useCallback, useEffect, useState } from "react";
import { Transaction } from "../model/transaction";
import { fetchTransactions } from "../transactions.service";
import { useMultiTransactionStatus } from "./contract/useMultiTransactionStatus";

export const useTransactions = () => {
  const activeChain = useActiveEVMChainConfig();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { fetchTransactionStatuses } = useMultiTransactionStatus();

  const refreshTransactions = useCallback(async () => {
    setTransactions(undefined);
    if (activeChain) {
      const { transactions: txs } = await fetchTransactions(activeChain, 0, 100);
      if (txs) {
        const statuses = await fetchTransactionStatuses(txs?.map(tx => tx.id));
        // Update dyanmic status of each transaction with latest dynamic contract value (not stored)
        for (const tx of txs) {
          tx.status = statuses?.find(s => s.id === tx.id)?.status || "Unknown";
        }
      }
      setTransactions(txs);
    }
  }, [activeChain, fetchTransactionStatuses]);

  useEffect(() => {
    void refreshTransactions();
  }, [refreshTransactions]);

  return { transactions, refreshTransactions }
}