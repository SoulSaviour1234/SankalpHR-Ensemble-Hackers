import React from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fbd4] to-[#f5f5f5] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader />
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
