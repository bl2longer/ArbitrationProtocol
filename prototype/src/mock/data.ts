// Mock Transactions
export const mockTransactions = [
  {
    id: '0',
    dapp: '0x1234567890123456789012345678901234567890',
    arbitrator: '0xabcdef0123456789abcdef0123456789abcdef01',
    startTime: Date.now() - 86400000, // 1 day ago
    deadline: Date.now() + 86400000, // 1 day from now
    btcTx: 'txid_123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
    status: 0, // Active
    depositedFee: '1000000000000000000', // 1 ETH
    signature: ''
  },
  {
    id: '1',
    dapp: '0x2345678901234567890123456789012345678901',
    arbitrator: '0xbcdef0123456789abcdef0123456789abcdef012',
    startTime: Date.now() - 172800000, // 2 days ago
    deadline: Date.now() - 86400000, // 1 day ago
    btcTx: 'txid_234567890abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
    status: 1, // Completed
    depositedFee: '2000000000000000000', // 2 ETH
    signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: '2',
    dapp: '0x3456789012345678901234567890123456789012',
    arbitrator: '0xcdef0123456789abcdef0123456789abcdef0123',
    startTime: Date.now() - 259200000, // 3 days ago
    deadline: Date.now() - 172800000, // 2 days ago
    btcTx: 'txid_345678901abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
    status: 2, // Arbitrated
    depositedFee: '3000000000000000000', // 3 ETH
    signature: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef'
  },
  {
    id: '3',
    dapp: '0x4567890123456789012345678901234567890123',
    arbitrator: '0xdef0123456789abcdef0123456789abcdef01234',
    startTime: Date.now() - 345600000, // 4 days ago
    deadline: Date.now() - 259200000, // 3 days ago
    btcTx: 'txid_456789012abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
    status: 3, // Expired
    depositedFee: '4000000000000000000', // 4 ETH
    signature: ''
  },
  {
    id: '4',
    dapp: '0x5678901234567890123456789012345678901234',
    arbitrator: '0xef0123456789abcdef0123456789abcdef012345',
    startTime: Date.now() - 432000000, // 5 days ago
    deadline: Date.now() - 345600000, // 4 days ago
    btcTx: 'txid_567890123abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
    status: 4, // Disputed
    depositedFee: '5000000000000000000', // 5 ETH
    signature: ''
  }
];

// Mock Compensations
export const mockCompensations = [
  {
    id: '0',
    receiver: '0x1234567890123456789012345678901234567890',
    amount: '1000000000000000000', // 1 ETH
    feeAmount: '100000000000000000', // 0.1 ETH
    compensationType: 0, // Illegal Signature
    claimed: false,
    assets: [
      {
        type: 'BTC',
        amount: '100000000', // 1 BTC in satoshis
        marketValue: '2000000000000000000' // 2 ETH
      }
    ]
  },
  {
    id: '1',
    receiver: '0x2345678901234567890123456789012345678901',
    amount: '2000000000000000000', // 2 ETH
    feeAmount: '200000000000000000', // 0.2 ETH
    compensationType: 1, // Timeout Penalty
    claimed: true,
    assets: [
      {
        type: 'BTC',
        amount: '200000000', // 2 BTC in satoshis
        marketValue: '4000000000000000000' // 4 ETH
      }
    ]
  },
  {
    id: '2',
    receiver: '0x3456789012345678901234567890123456789012',
    amount: '3000000000000000000', // 3 ETH
    feeAmount: '300000000000000000', // 0.3 ETH
    compensationType: 0, // Illegal Signature
    claimed: false,
    assets: [
      {
        type: 'BTC',
        amount: '300000000', // 3 BTC in satoshis
        marketValue: '6000000000000000000' // 6 ETH
      }
    ]
  }
];
