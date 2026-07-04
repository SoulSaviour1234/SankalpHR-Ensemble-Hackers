import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const TimeOff: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Time Off Requests</h1>
        <Link
          to="/timeoff/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 shadow rounded-lg border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Paid Time Off</h3>
          <p className="text-2xl font-bold">24 Days Available</p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Sick Time Off</h3>
          <p className="text-2xl font-bold">07 Days Available</p>
        </div>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Requests</h3>
        </div>
        <div className="p-6 text-center text-gray-500">
          No time off requests found.
        </div>
      </div>
    </div>
  );
};

export default TimeOff;
