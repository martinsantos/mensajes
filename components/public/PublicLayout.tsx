import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 py-4 bg-white border-b border-gray-200">
        <div className="container px-4 mx-auto">
          <Link to="/" aria-label="Back to homepage">
            <h1 className="text-3xl font-extrabold tracking-tight text-center text-primary-700 transition-colors hover:text-primary-800">
                Gemini News Hub
            </h1>
          </Link>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="py-6 mt-8 bg-white border-t">
        <div className="container px-4 mx-auto text-sm text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Gemini News Hub. All rights reserved.</p>
          <div className="flex justify-center mt-2 space-x-6">
            <Link to="/login" className="text-primary-600 hover:underline">Admin Login</Link>
            <button onClick={() => alert('The "About Us" page is not yet implemented.')} className="text-primary-600 hover:underline">About Us</button>
            <button onClick={() => alert('The "Contact Us" page is not yet implemented.')} className="text-primary-600 hover:underline">Contact Us</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
