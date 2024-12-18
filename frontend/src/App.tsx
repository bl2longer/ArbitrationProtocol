import 'reflect-metadata';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EVMProvider } from './contexts/EVMContext/EVMContext';
import Layout from './components/layout/Layout';
import ArbitratorList from './pages/ArbitratorList/ArbitratorList';
import ArbitratorDashboard from './pages/ArbitratorDashboard/ArbitratorDashboard';
import TransactionList from './pages/TransactionList/TransactionList';
import CompensationList from './pages/CompensationList/CompensationList';
import { WalletProvider } from './contexts/WalletContext/WalletContext';
import RegisterDApp from './pages/RegisterDApp/RegisterDApp';
import RegisterArbitrator from './pages/RegisterArbitrator/RegisterArbitrator';

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
            <Route path="/register-dapp" element={<RegisterDApp />} />
            <Route path="/register-arbitrator" element={<RegisterArbitrator />} />
          </Routes>
        </Layout>
      </Router>
    </WalletProvider>
  );
}

export default App;
