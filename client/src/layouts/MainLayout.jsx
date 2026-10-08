import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { MobileNav } from '../components/layout/MobileNav';
import { SearchModal } from '../components/search/SearchModal';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { Toast } from '../components/common/Toast';

export const MainLayout = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <SearchModal />
      <QuickViewModal />
      <Toast />
    </div>
  );
};
