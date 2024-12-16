import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import Layout from './components/Layout';
import ArbitratorList from './pages/ArbitratorList';
import ArbitratorDashboard from './pages/ArbitratorDashboard';
import TransactionList from './pages/TransactionList';
import CompensationList from './pages/CompensationList';
import React from 'react';

function App() {
  return (
    <Web3Provider>
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
    </Web3Provider>
  );
}

export default App;
