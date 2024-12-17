import 'reflect-metadata';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EVMProvider } from './contexts/EVMContext/EVMContext';
import Layout from './components/Layout';
import ArbitratorList from './pages/ArbitratorList/ArbitratorList';
import ArbitratorDashboard from './pages/ArbitratorDashboard';
import TransactionList from './pages/TransactionList';
import CompensationList from './pages/CompensationList';
import React from 'react';
import { useArbitrators } from './services/arbitrators/hooks/useArbitrators';
import { WalletProvider } from './contexts/WalletContext/WalletContext';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<ArbitratorList />} />
            <Route path="/arbitrators" element={<ArbitratorList />} />
            <Route path="/dashboard" element={<ArbitratorDashboard />} />
            <Route path="/transactions" element={<TransactionList />} />
            <Route path="/compensations" element={<CompensationList />} />
          </Routes>
        </Layout>
      </Router>
    </WalletProvider>
  );
}

export default App;
