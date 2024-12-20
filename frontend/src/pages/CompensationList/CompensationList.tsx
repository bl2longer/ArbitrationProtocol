import { useState, useEffect, useMemo } from 'react';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { Loading } from '@/components/base/Loading';
import { useCompensations } from '@/services/compensations/hooks/useCompensations';
import { CompensationClaim } from '@/services/compensations/model/compensation-claim';
import { CompensationDetailsDialog } from './CompensationDetailsDialog';
import { PageTitle } from '@/components/base/PageTitle';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusLabel } from '@/components/base/StatusLabel';

// TODO
const compensationTypeMap = {
  0: 'Illegal Signature',
  1: 'Timeout Penalty'
};

export default function CompensationList() {
  const { compensations } = useCompensations();
  const [selectedCompensation, setSelectedCompensation] = useState<CompensationClaim | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const loading = useMemo(() => !compensations, [compensations]);

  if (loading)
    return <Loading />

  return (
    <PageContainer>
      {/* Title header */}
      <PageTitleRow>
        <PageTitle>Compensations</PageTitle>
      </PageTitleRow>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                ID
              </TableHead>
              <TableHead>
                Receiver
              </TableHead>
              <TableHead>
                Amount
              </TableHead>
              <TableHead>
                Type
              </TableHead>
              <TableHead>
                Status
              </TableHead>
              <TableHead>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compensations.map((compensation, index) => (
              <TableRow key={compensation.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <TableCell>
                  {compensation.id.slice(0, 10)}...
                </TableCell>
                <TableCell>
                  {/* {compensation.receiver.slice(0, 10)}... */}
                </TableCell>
                <TableCell>
                  {`${compensation.amount}`} ETH
                </TableCell>
                <TableCell>
                  {/* {compensationTypeMap[compensation.compensationType as keyof typeof compensationTypeMap]} */}
                </TableCell>
                <TableCell>
                  <StatusLabel title={compensation.withdrawn ? 'Withdrawn' : 'Unclaimed'} color={compensation.withdrawn ? 'green' : 'yellow'} />
                </TableCell>
                <TableCell className="px-6 py-4 text-sm">
                  {!compensation.withdrawn && (
                    <Button
                      onClick={() => {
                        setSelectedCompensation(compensation);
                        setIsDetailsDialogOpen(true);
                      }}>
                      Claim Compensation
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CompensationDetailsDialog
        compensation={selectedCompensation}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)} />
    </PageContainer>
  );
}
