import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ProfileSettings from './ProfileSettings';

// Use this as your ONLY entry point
const SettingsIndex = () => {
  return (
    <div className="flex flex-row min-h-screen">
      {/* 1. Sidebar Navigation */}
      <aside className="w-64 border-r border-gray-200 p-4">
        <nav className="flex flex-col gap-2">
          <Link to="/settings/profile" className="p-2 hover:bg-gray-100 rounded">
            Profile
          </Link>
          <Link to="/settings/account" className="p-2 hover:bg-gray-100 rounded">
            Account
          </Link>
        </nav>
      </aside>

      {/* 2. Content Area */}
      <main className="flex-1 p-8">
        <Routes>
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="/" element={<ProfileSettings />} />
          {/* Add more routes here as you reduce other settings pages */}
        </Routes>
      </main>
    </div>
  );
};

export default SettingsIndex;
