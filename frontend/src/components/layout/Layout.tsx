import { useOwnedArbitrator } from '@/services/arbitrators/hooks/useOwnedArbitrator';
import Navbar from './Navbar';
import { FC, useEffect } from 'react';
import { useArbitrators } from '@/services/arbitrators/hooks/useArbitrators';

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fetchArbitrators } = useArbitrators();
  const { fetchOwnedArbitrator } = useOwnedArbitrator();

  useEffect(() => {
    void fetchOwnedArbitrator();
  }, [fetchOwnedArbitrator]);

  useEffect(() => {
    void fetchArbitrators();
  }, [fetchArbitrators]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Navbar />
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
export default Layout;