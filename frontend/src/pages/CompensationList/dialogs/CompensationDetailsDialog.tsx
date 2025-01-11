import { CopyField } from '@/components/base/CopyField';
import { StatusLabel } from '@/components/base/StatusLabel';
import { TokenWithValue } from '@/components/base/TokenWithValue';
import { DetailsTableCellWithLabel } from '@/components/dialogs/parts/DetailsTableCellWithLabel';
import { DetailsTableCellWithValue } from '@/components/dialogs/parts/DetailsTableCellWithValue';
import { DetailsTableRow } from '@/components/dialogs/parts/DetailsTableRow';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody } from '@/components/ui/table';
import { useActiveEVMChainConfig } from '@/services/chains/hooks/useActiveEVMChainConfig';
import { useWithdrawCompensation } from '@/services/compensations/hooks/contract/useWithdrawCompensation';
import { CompensationClaim } from '@/services/compensations/model/compensation-claim';
import { formatAddress } from '@/utils/formatAddress';
import { FC, useCallback } from 'react';
import { useCompensationActionStatus } from '../hooks/useCompensationActionStatus';

export const CompensationDetailsDialog: FC<{
  compensation: CompensationClaim;
  isOpen: boolean;
  onHandleClose: () => void;
}> = ({ compensation, isOpen, onHandleClose }) => {
  const activeChain = useActiveEVMChainConfig();
  const { withdrawCompensation, isPending } = useWithdrawCompensation();
  const { hasAvailableAction, canWithdrawCompensation } = useCompensationActionStatus(compensation);

  const handleWithdrawCompensation = useCallback(async () => {
    try {
      await withdrawCompensation(compensation.id);
      onHandleClose();
    } catch (error) {
      console.error('Error withdrawing compensation:', error);
    }
  }, [compensation, onHandleClose, withdrawCompensation]);

  if (!compensation)
    return null;

  return <Dialog open={isOpen} onOpenChange={onHandleClose}>
    {/* Prevent focus for tooltip not to auto show */}
    <DialogContent aria-description="Transaction details" onOpenAutoFocus={e => e.preventDefault()}>
      <DialogHeader>
        <DialogTitle className='gap-4 flex items-center'>
          Compensation claim details
          <StatusLabel title={compensation.withdrawn ? 'Withdrawn' : 'Unclaimed'} color={compensation.withdrawn ? 'green' : 'yellow'} />
        </DialogTitle>
        <DialogDescription className="flex gap-1 items-center">
          {formatAddress(compensation.id, [14, 12])}
          <CopyField value={compensation.id} />
        </DialogDescription>
      </DialogHeader>

      <Table>
        <TableBody>
          <DetailsTableRow>
            <DetailsTableCellWithLabel>Arbiter</DetailsTableCellWithLabel>
            <DetailsTableCellWithValue>{formatAddress(compensation.arbiter, [10, 8])} <CopyField value={compensation.arbiter} /></DetailsTableCellWithValue>
          </DetailsTableRow>
          <DetailsTableRow>
            <DetailsTableCellWithLabel>Claimer</DetailsTableCellWithLabel>
            <DetailsTableCellWithValue>{formatAddress(compensation.claimer, [10, 8])} <CopyField value={compensation.claimer} /></DetailsTableCellWithValue>
          </DetailsTableRow>
          <DetailsTableRow>
            <DetailsTableCellWithLabel>Claim Amount</DetailsTableCellWithLabel>
            <DetailsTableCellWithValue>{compensation.ethAmount ? <TokenWithValue amount={compensation.ethAmount} token={activeChain?.nativeCurrency} decimals={5} /> : "-"}</DetailsTableCellWithValue>
          </DetailsTableRow>
          <DetailsTableRow>
            <DetailsTableCellWithLabel>System Fee</DetailsTableCellWithLabel>
            <DetailsTableCellWithValue>{compensation.systemFee ? <TokenWithValue amount={compensation.systemFee} token={activeChain?.nativeCurrency} decimals={5} /> : "-"}</DetailsTableCellWithValue>
          </DetailsTableRow>
          <DetailsTableRow>
            <DetailsTableCellWithLabel>Total amount</DetailsTableCellWithLabel>
            <DetailsTableCellWithValue>{compensation.totalAmount ? <TokenWithValue amount={compensation.totalAmount} token={activeChain?.nativeCurrency} decimals={5} /> : "-"}</DetailsTableCellWithValue>
          </DetailsTableRow>
        </TableBody>
      </Table>

      {/* Actions */}
      {hasAvailableAction &&
        <div className="flex pt-2 justify-end gap-2">
          {
            canWithdrawCompensation &&
            <Button onClick={handleWithdrawCompensation} disabled={isPending}>Withdraw compensation</Button>
          }
        </div>
      }
    </DialogContent>
  </Dialog>
}