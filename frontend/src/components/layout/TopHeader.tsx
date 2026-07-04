import React from 'react';
import { Search, Settings } from 'lucide-react';

const TopHeader: React.FC = () => {
  return (
    <header className="h-16 bg-transparent flex items-center justify-end px-8">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search employee or actions"
            className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-hrms-lime"
          />
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default TopHeader;