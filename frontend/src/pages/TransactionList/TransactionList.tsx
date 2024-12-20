import { useState, useMemo, FC } from 'react';
import { Transaction } from '@/services/transactions/model/transaction';
import { useTransactions } from '@/services/transactions/hooks/useTransactions';
import { isNullOrUndefined } from '@/utils/isNullOrUndefined';
import { PageTitle } from '@/components/base/PageTitle';
import { SearchInput } from '@/components/base/SearchInput';
import { Loading } from '@/components/base/Loading';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { RefreshCwIcon } from 'lucide-react';
import { SubmitArbitrationDialog } from './dialogs/SubmitArbitrationDialog';
import { formatAddress } from '@/utils/formatAddress';
import { formatDateWithoutYear } from '@/utils/dates';
import { StatusLabel } from '@/components/base/StatusLabel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const fieldLabels: Partial<Record<keyof Transaction, string>> = {
  dapp: 'DApp',
  arbitrator: 'Arbitrator',
  startTime: 'Start Time',
  deadline: 'Deadline',
  btcTx: 'BTC Tx',
  status: 'Status',
  depositedFee: 'Deposited Fee',
  // signature: 'Signature'
};

export default function TransactionList() {
  const { transactions: rawTransactions, refreshTransactions } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const transactions = useMemo(() => {
    return rawTransactions?.filter(tx => {
      const searchLower = searchTerm.toLowerCase();
      return (
        tx.dapp?.toLowerCase().includes(searchLower) ||
        tx.arbitrator?.toLowerCase().includes(searchLower) ||
        tx.btcTx?.toLowerCase().includes(searchLower)
      );
    });
  }, [rawTransactions, searchTerm]);

  const loading = useMemo(() => isNullOrUndefined(transactions), [transactions]);

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle className="flex flex-grow sm:flex-grow-0">Transaction List</PageTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={refreshTransactions}>
            <RefreshCwIcon />
          </Button>
          <SearchInput placeholder="Search transactions..."
            value={searchTerm}
            onChange={(newValue) => setSearchTerm(newValue)} />
        </div>
      </PageTitleRow>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {Object.values(fieldLabels).map(field => (
                <TableHead key={field}>
                  {field}
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((tx, index) => <TransactionRow
              transaction={tx}
              key={index}
              onSubmitArbitration={() => {
                setSelectedTransaction(tx);
                setIsSignDialogOpen(true);
              }} />)}
          </TableBody>
        </Table>
      </div>

      {loading && <Loading />}

      <SubmitArbitrationDialog transaction={selectedTransaction} isOpen={isSignDialogOpen} onHandleClose={() => setIsSignDialogOpen(false)} />

    </PageContainer>
  );
}

const TransactionRow: FC<{
  transaction: Transaction;
  onSubmitArbitration: () => void;
}> = ({ transaction, onSubmitArbitration }) => {

  const formatValue = (key: keyof typeof fieldLabels, value: any) => {
    if (key === 'startTime' || key === 'deadline')
      return value ? formatDateWithoutYear(value) : "Not set";

    if (key === 'status')
      return <StatusLabel title={value} color={value === "Completed" ? "green" : "red"} />

    if (key === 'dapp' || key === 'arbitrator')
      return formatAddress(value);

    if (key === 'btcTx')
      return formatAddress(value) || "Not set";

    return value;
  };

  return (
    <TableRow>
      {Object.keys(fieldLabels).map((field: keyof Transaction) => (
        <TableCell key={field}>
          {formatValue(field, transaction[field as keyof Transaction])}
        </TableCell>
      ))}
      <TableCell>
        {transaction.status === "Active" && (
          <Button onClick={onSubmitArbitration}>
            Submit Arbitration
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}