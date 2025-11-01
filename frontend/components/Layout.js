import { AnimatedSidebarDemo } from './AnimatedSidebar';
import { useState } from 'react';

export default function Layout({ children }) {
  return (
    <div className="app-container">
      <AnimatedSidebarDemo />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
