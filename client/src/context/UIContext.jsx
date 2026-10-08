import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  const closeToast = () => setToast(null);

  return (
    <UIContext.Provider
      value={{
        mobileNavOpen,
        setMobileNavOpen,
        searchModalOpen,
        setSearchModalOpen,
        quickViewProduct,
        setQuickViewProduct,
        toast,
        showToast,
        closeToast,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
