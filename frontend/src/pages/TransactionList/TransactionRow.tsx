import { CopyField } from '@/components/base/CopyField';
import { StatusLabel } from '@/components/base/StatusLabel';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { CompensationType } from '@/services/compensations/model/compensation-claim';
import { isSameEVMAddress } from '@/services/evm/evm';
import { Transaction } from '@/services/transactions/model/transaction';
import { transactionStatusLabelColor, transactionStatusLabelTitle } from '@/services/transactions/transactions.service';
import { formatDate } from '@/utils/dates';
import { formatAddress } from '@/utils/formatAddress';
import { formatBigNumber } from '@/utils/formatBigNumber';
import moment from 'moment';
import { FC, useMemo } from 'react';
import { transactionFieldLabels } from './TransactionList';

export const TransactionRow: FC<{
  transaction: Transaction;
  onSubmitArbitration: () => void;
  onRequestCompensation: (compensationType: CompensationType) => void;
}> = ({ transaction, onSubmitArbitration, onRequestCompensation }) => {
  const { evmAccount } = useWalletContext();
  const activeChain = useActiveEVMChainConfig();

  const formatValue = (key: keyof typeof transactionFieldLabels, value: any) => {
    if (key === 'startTime' || key === 'deadline')
      return value ? <div className='flex flex-row items-center'>{formatDate(value)} <CopyField value={value} /></div> : "-";

    if (key === 'status')
      return <StatusLabel title={transactionStatusLabelTitle(transaction)} color={transactionStatusLabelColor(transaction)} />

    if (key === 'dapp' || key === 'arbiter')
      return value ? <div className='flex flex-row items-center'>{formatAddress(value)} <CopyField value={value} /></div> : "-";

    if (key === 'btcTx')
      return value ? <div className='flex flex-row items-center'>{formatAddress(value)} <CopyField value={value} /></div> : "-";

    if (key === 'depositedFee')
      return value ? <span>{formatBigNumber(transaction.depositedFee, 5)} {activeChain?.nativeCurrency.symbol}</span> : "-";

    return value;
  };

  const canSubmitArbitration = useMemo(() => {
    return (
      transaction.status === "Arbitrated" &&
      isSameEVMAddress(transaction.arbiter, evmAccount)
    );
  }, [transaction, evmAccount]);

  /* 
   * If transaction deadline is passed, and transaction is in arbitration,
   * then the timeoutCompensationReceiver can request a timeout compensation 
   */
  const canRequestTimeoutCompensation = useMemo(() => {
    return (
      transaction.status === "Arbitrated" &&
      transaction.timeoutCompensationReceiver === evmAccount &&
      moment().isAfter(transaction.deadline)
    );
  }, [transaction, evmAccount]);

  /**
   * Arbiter has submitted a signature but user considers this is a malicious activity from the arbiter.
   * User can submit a failed arbitration compensation request.
   */
  const canRequestFailedArbitrationCompensation = useMemo(() => {
    return (
      transaction.status === "Arbitrated" &&
      transaction.timeoutCompensationReceiver === evmAccount
    );
  }, [transaction, evmAccount]);

  /**
   * Nobody submitted an arbitration request, but the arbiter might have collided with one of the 
   * users to submit the bitcoin transaction. The other user can then submit the malicious transaction.
   */
  const canRequestIllegalSignatureCompensation = useMemo(() => {
    return (
      transaction.status !== "Arbitrated" &&
      transaction.compensationReceiver === evmAccount
    );
  }, [transaction, evmAccount]);

  return (
    <TableRow>
      {Object.keys(transactionFieldLabels).map((field: keyof Transaction) => (
        <TableCell key={field}>
          {formatValue(field, transaction[field as keyof Transaction])}
        </TableCell>
      ))}
      <TableCell>
        {/* Transaction has an arbitration requested, so the arbiter can sign. */}
        {
          canSubmitArbitration &&
          <Button onClick={onSubmitArbitration}>Submit signature</Button>
        }

        {/* Request timeout compensation */}
        {
          canRequestTimeoutCompensation &&
          <Button onClick={() => onRequestCompensation("Timeout")}>Request compensation</Button>
        }

        {/* Request failed arbitration compensation */}
        {
          canRequestFailedArbitrationCompensation &&
          <Button onClick={() => onRequestCompensation("FailedArbitration")}>Request compensation</Button>
        }

        {/* Request illegal signature compensation */}
        {
          canRequestIllegalSignatureCompensation &&
          <Button onClick={() => onRequestCompensation("IllegalSignature")}>Request compensation</Button>
        }

        {/* 
If the tx is not in arbitration, only show the compensation button to bob. 
If the tx is in arbitration , only show the button to timeout compensation user( alice )
 */}

        {/* 
        TODO:
        If the transaction is registered but no arbitration is applied for, then Alice may collude with the arbiter, and Bob can apply for compensation here.
        If Alice applies for arbitration, but the arbiter does not sign in time, then Alice can apply for compensation.
        So these are different people.

        So compensationReceiver and timeoutCompensationReceiver should be used differently.
         */}

      </TableCell>
    </TableRow>
  )
}