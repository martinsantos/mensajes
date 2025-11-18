import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import NewspaperIcon from '../icons/NewspaperIcon';
import HomeIcon from '../icons/HomeIcon';
import CategoryIcon from '../icons/CategoryIcon';
import LogoutIcon from '../icons/LogoutIcon';
import ExternalLinkIcon from '../icons/ExternalLinkIcon';

interface AdminLayoutProps {
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout }) => {
  const navLinkClasses = "flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-primary-100 hover:text-primary-700 transition-colors duration-200";
  const activeNavLinkClasses = "bg-primary-100 text-primary-700 font-semibold";

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="flex flex-col w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-primary-700">Gemini News</h1>
          <p className="text-sm text-gray-500">Admin Panel</p>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <NavLink to="/admin" end className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
            <HomeIcon className="w-5 h-5 mr-3" /> Dashboard
          </NavLink>
          <NavLink to="/admin/noticias" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
            <NewspaperIcon className="w-5 h-5 mr-3" /> Noticias
          </NavLink>
          <NavLink to="/admin/tropos" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>
            <CategoryIcon className="w-5 h-5 mr-3" /> Tropos
          </NavLink>
        </nav>
        <div className="p-4 space-y-2 border-t">
          <Link to="/" target="_blank" rel="noopener noreferrer" className="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200">
             <ExternalLinkIcon className="w-5 h-5 mr-3" /> Volver a la Portada
           </Link>
          <button onClick={onLogout} className="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors duration-200">
            <LogoutIcon className="w-5 h-5 mr-3" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;