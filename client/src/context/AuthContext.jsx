import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('gyaan_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.data?.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error('Failed to authenticate token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const { user: loggedInUser, token: authToken } = response.data;
    localStorage.setItem('gyaan_token', authToken);
    setToken(authToken);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    const { user: registeredUser, token: authToken } = response.data;
    localStorage.setItem('gyaan_token', authToken);
    setToken(authToken);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem('gyaan_token');
    setToken(null);
    setUser(null);
  };

  const updateUserState = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin,
        login,
        register,
        logout,
        updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
