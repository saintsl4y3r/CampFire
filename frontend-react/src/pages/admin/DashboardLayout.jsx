// src/pages/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavigationBar from '../components/NavBar';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar hoặc Navigation */}
      <aside className="w-64 border-r bg-white">
        <NavigationBar />
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
