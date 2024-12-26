import { StatusLabel } from '@/components/base/StatusLabel';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { Transaction } from '@/services/transactions/model/transaction';
import { formatDateWithoutYear } from '@/utils/dates';
import { formatAddress } from '@/utils/formatAddress';
import { FC } from 'react';
import { transactionFieldLabels } from './TransactionList';

export const TransactionRow: FC<{
  transaction: Transaction;
  onSubmitArbitration: () => void;
}> = ({ transaction, onSubmitArbitration }) => {
  const { evmAccount } = useWalletContext();

  console.log(transaction)

  const formatValue = (key: keyof typeof transactionFieldLabels, value: any) => {
    if (key === 'startTime' || key === 'deadline')
      return value ? formatDateWithoutYear(value) : "-";

    if (key === 'status')
      return <StatusLabel title={value} color={value === "Completed" ? "green" : "red"} />

    if (key === 'dapp' || key === 'arbiter')
      return value ? formatAddress(value) : "-";

    if (key === 'btcTx')
      return formatAddress(value) || "-";

    return value;
  };

  return (
    <TableRow>
      {Object.keys(transactionFieldLabels).map((field: keyof Transaction) => (
        <TableCell key={field}>
          {formatValue(field, transaction[field as keyof Transaction])}
        </TableCell>
      ))}
      <TableCell>
        {/* Transaction's elected arbiter can sign.*/}
        {
          transaction.status === "Active" && transaction.arbiter === evmAccount &&
          <Button onClick={onSubmitArbitration}>Submit signature</Button>
        }
      </TableCell>
    </TableRow>
  )
}