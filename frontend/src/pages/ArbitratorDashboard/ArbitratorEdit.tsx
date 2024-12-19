import { ArbitratorInfo } from "@/services/arbitrators/model/arbitrator-info";
import { FC, useState } from "react";

export const ArbitratorEdit: FC<{
  arbitrator: ArbitratorInfo;
  onEditionComplete: () => void;
}> = ({ arbitrator, onEditionComplete }) => {
  const [editForm, setEditForm] = useState({
    operator: '',
    btcPubKey: '',
    btcAddress: '',
    feeRate: '',
    termDuration: '',
  });

  const handleSubmit = () => {
    console.log('Submitting changes:', editForm);
    onEditionComplete();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="space-y-6">
        <div className="bg-white rounded-lg shadow divide-y">
          <div className="p-4 space-y-2">
            <label className="block text-sm text-gray-500">Operator Address</label>
            <input
              type="text"
              value={editForm.operator}
              onChange={(e) => setEditForm(prev => ({ ...prev, operator: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-4 space-y-2">
            <label className="block text-sm text-gray-500">BTC Public Key</label>
            <input
              type="text"
              value={editForm.btcPubKey}
              onChange={(e) => setEditForm(prev => ({ ...prev, btcPubKey: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-4 space-y-2">
            <label className="block text-sm text-gray-500">BTC Address</label>
            <input
              type="text"
              value={editForm.btcAddress}
              onChange={(e) => setEditForm(prev => ({ ...prev, btcAddress: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-4 space-y-2">
            <label className="block text-sm text-gray-500">Fee Rate (%)</label>
            <input
              type="number"
              step="0.01"
              value={editForm.feeRate}
              onChange={(e) => setEditForm(prev => ({ ...prev, feeRate: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-4 space-y-2">
            <label className="block text-sm text-gray-500">Term Duration (days)</label>
            <input
              type="number"
              step="1"
              value={editForm.termDuration}
              onChange={(e) => setEditForm(prev => ({ ...prev, termDuration: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onEditionComplete}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}