import { CopyField } from "@/components/base/CopyField";
import { StatusLabel } from "@/components/base/StatusLabel";
import { TokenWithValue } from "@/components/base/TokenWithValue";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useActiveChainNativeCoin } from "@/services/chains/hooks/useActiveChainNativeCoin";
import { CompensationClaim } from "@/services/compensations/model/compensation-claim";
import { formatAddress } from "@/utils/formatAddress";
import { FC } from "react";

export const CompensationRow: FC<{
  compensation: CompensationClaim;
  index: number;
  setSelectedCompensation: (compensation: CompensationClaim) => void;
}> = ({ compensation, index, setSelectedCompensation }) => {
  const nativeCoin = useActiveChainNativeCoin();

  return (
    <TableRow key={compensation.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
      <TableCell>
        <div className='flex flex-row items-center'>
          {formatAddress(compensation.id)} <CopyField value={compensation.id} />
        </div>
      </TableCell>
      <TableCell>
        <div className='flex flex-row items-center'>
          {compensation.arbiter ? <>{formatAddress(compensation.arbiter)} <CopyField value={compensation.arbiter} /></> : "-"}
        </div>
      </TableCell>
      <TableCell>
        <div className='flex flex-row items-center'>
          {compensation.claimer ? <>{formatAddress(compensation.claimer)} <CopyField value={compensation.claimer} /></> : "-"}
        </div>
      </TableCell>
      <TableCell>
        <TokenWithValue amount={compensation.ethAmount} token={nativeCoin} decimals={5} />
      </TableCell>
      <TableCell>
        <TokenWithValue amount={compensation.totalAmount} token={nativeCoin} decimals={5} />
      </TableCell>
      <TableCell>
        <StatusLabel title={compensation.withdrawn ? 'Withdrawn' : 'Unclaimed'} color={compensation.withdrawn ? 'green' : 'yellow'} />
      </TableCell>
      <TableCell className="px-6 py-4 text-sm">
        {!compensation.withdrawn && (
          <Button onClick={() => { setSelectedCompensation(compensation) }}>
            Claim Compensation
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}