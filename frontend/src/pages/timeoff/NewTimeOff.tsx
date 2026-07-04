import React from 'react';
import { useNavigate } from 'react-router-dom';

const NewTimeOff: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white shadow sm:rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">New Time Off Request</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Time Off Type</label>
          <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm">
            <option>Paid Time Off</option>
            <option>Sick Leave</option>
            <option>Unpaid Leave</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">From</label>
            <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To</label>
            <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Attachment (Optional)</label>
          <input type="file" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Discard
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 shadow-sm">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTimeOff;
