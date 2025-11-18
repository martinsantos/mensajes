import React from 'react';
import useNewsData from '../../hooks/useNewsData';
import NewspaperIcon from '../icons/NewspaperIcon';
import CategoryIcon from '../icons/CategoryIcon';

const DashboardPage: React.FC = () => {
  const { noticias, tropos, loading, error } = useNewsData();

  if (loading) {
    return <div className="text-center text-gray-500">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">{error}</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100">
              <NewspaperIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Noticias</p>
              <p className="text-2xl font-semibold text-gray-900">{noticias.length}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100">
              <CategoryIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tropos</p>
              <p className="text-2xl font-semibold text-gray-900">{tropos.length}</p>
            </div>
          </div>
        </div>
      </div>
       <div className="p-6 mt-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800">Welcome to Gemini News Hub!</h2>
            <p className="mt-2 text-gray-600">
                This is your central command for managing all content. Use the sidebar to navigate between news articles (Noticias) and categories (Tropos).
                You can create, edit, and delete content with ease.
            </p>
        </div>
    </div>
  );
};

export default DashboardPage;
