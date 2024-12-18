import { useState, useEffect, useMemo } from 'react';
import { useWalletContext } from '@/contexts/WalletContext/WalletContext';
import { Loading } from '@/components/Loading';
import { useCompensations } from '@/services/compensations/hooks/useCompensations';
import { CompensationClaim } from '@/services/compensations/model/compensation-claim';
import { CompensationDetailsDialog } from './CompensationDetailsDialog';

// TODO
const compensationTypeMap = {
  0: 'Illegal Signature',
  1: 'Timeout Penalty'
};

export default function CompensationList() {
  const { evmAccount: account } = useWalletContext();
  const { compensations } = useCompensations();
  const [selectedCompensation, setSelectedCompensation] = useState<CompensationClaim | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = useMemo(() => !compensations, [compensations]);

  if (loading)
    return <Loading />

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Receiver
              </th>
              <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {compensations.map((compensation, index) => (
              <tr key={compensation.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {compensation.id.slice(0, 10)}...
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {/* {compensation.receiver.slice(0, 10)}... */}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {`${compensation.amount}`} ETH
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {/* {compensationTypeMap[compensation.compensationType as keyof typeof compensationTypeMap]} */}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {<span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${compensation.withdrawn
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}
                  >
                    {compensation.withdrawn ? 'Withdrawn' : 'Unclaimed'}
                  </span>}
                </td>
                <td className="px-6 py-4 text-sm">
                  {!compensation.withdrawn && (
                    <button
                      onClick={() => {
                        setSelectedCompensation(compensation);
                        setIsDetailsDialogOpen(true);
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Claim Compensation
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CompensationDetailsDialog
        compensation={selectedCompensation}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)} />
    </div>
  );
}
