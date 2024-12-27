import { CopyField } from '@/components/base/CopyField';
import { StatusLabel } from '@/components/base/StatusLabel';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { Transaction } from '@/services/transactions/model/transaction';
import { transactionStatusLabelColor } from '@/services/transactions/transactions.service';
import { formatDateWithoutYear } from '@/utils/dates';
import { formatAddress } from '@/utils/formatAddress';
import { FC } from 'react';
import { transactionFieldLabels } from './TransactionList';

export const TransactionRow: FC<{
  transaction: Transaction;
  onSubmitArbitration: () => void;
}> = ({ transaction, onSubmitArbitration }) => {
  const { evmAccount } = useWalletContext();

  const formatValue = (key: keyof typeof transactionFieldLabels, value: any) => {
    if (key === 'startTime' || key === 'deadline')
      return value ? <div className='flex flex-row items-center'>{formatDateWithoutYear(value)} <CopyField value={value} /></div> : "-";

    if (key === 'status')
      return <StatusLabel title={value} color={transactionStatusLabelColor(transaction)} />

    if (key === 'dapp' || key === 'arbiter')
      return value ? <div className='flex flex-row items-center'>{formatAddress(value)} <CopyField value={value} /></div> : "-";

    if (key === 'btcTx')
      return value ? <div className='flex flex-row items-center'>{formatAddress(value)} <CopyField value={value} /></div> : "-";

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