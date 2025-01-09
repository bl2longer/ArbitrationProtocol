import { IconTooltip } from '@/components/base/IconTooltip';
import { PageContainer } from '@/components/base/PageContainer';
import { PageTitle } from '@/components/base/PageTitle';
import { PageTitleRow } from '@/components/base/PageTitleRow';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { tooltips } from '@/config/tooltips';
import { useCompensations } from '@/services/compensations/hooks/useCompensations';
import { CompensationClaim } from '@/services/compensations/model/compensation-claim';
import { RefreshCwIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CompensationRow } from './CompensationRow';

export default function CompensationList() {
  const { refreshCompensations, compensations } = useCompensations();
  const [selectedCompensation, setSelectedCompensation] = useState<CompensationClaim | null>(null);

  const loading = useMemo(() => !compensations, [compensations]);

  // Refresh list when page loads
  useEffect(() => {
    void refreshCompensations();
  }, [refreshCompensations]);

  return (
    <PageContainer>
      {/* Title header */}
      <PageTitleRow>
        <PageTitle>Compensations <IconTooltip title='Compensations' tooltip={tooltips.compensationIntro} iconClassName='ml-2' iconSize={20} /></PageTitle>
        <div className="flex space-x-4 w-full sm:w-auto items-center">
          <Button variant="outline" size="icon" onClick={refreshCompensations}>
            <RefreshCwIcon />
          </Button>
        </div>
      </PageTitleRow>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                ID
              </TableHead>
              <TableHead>
                Arbiter
              </TableHead>
              <TableHead>
                Claimer
              </TableHead>
              <TableHead>
                Claim amount
              </TableHead>
              <TableHead>
                Total amount
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
            {compensations?.map((compensation, index) => (
              <CompensationRow
                key={compensation.id}
                compensation={compensation}
                index={index}
                setSelectedCompensation={setSelectedCompensation}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
}
