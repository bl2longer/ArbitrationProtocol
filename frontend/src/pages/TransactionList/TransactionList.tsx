import { IconTooltip } from '@/components/base/IconTooltip';
import { Loading } from '@/components/base/Loading';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitle } from '@/components/base/PageTitle';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { SearchInput } from '@/components/base/SearchInput';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { tooltips } from '@/config/tooltips';
import { useTransactions } from '@/services/transactions/hooks/useTransactions';
import { Transaction } from '@/services/transactions/model/transaction';
import { isNullOrUndefined } from '@/utils/isNullOrUndefined';
import { RefreshCwIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SubmitSignatureDialog } from './dialogs/SubmitSignatureDialog';
import { TransactionRow } from './TransactionRow';

export const transactionFieldLabels: Partial<Record<keyof Transaction, string>> = {
  dapp: 'DApp',
  arbiter: 'Arbiter',
  startTime: 'Start Time',
  deadline: 'Deadline',
  btcTx: 'BTC Tx',
  depositedFee: 'Deposited Fee',
  status: 'Status',
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
        tx.arbiter?.toLowerCase().includes(searchLower) ||
        tx.btcTx?.toLowerCase().includes(searchLower)
      );
    });
  }, [rawTransactions, searchTerm]);

  const loading = useMemo(() => isNullOrUndefined(transactions), [transactions]);

  return (
    <PageContainer>
      <PageTitleRow>
        <PageTitle className="flex flex-grow sm:flex-grow-0">Transactions <IconTooltip title='Transactions' tooltip={tooltips.transactionIntro} iconClassName='ml-2' iconSize={20} /></PageTitle>
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
              {Object.values(transactionFieldLabels).map(field => (
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

      <SubmitSignatureDialog transaction={selectedTransaction} isOpen={isSignDialogOpen} onHandleClose={() => setIsSignDialogOpen(false)} />

    </PageContainer>
  );
}

