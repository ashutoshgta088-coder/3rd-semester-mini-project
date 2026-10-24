import React, { createContext, useState, useContext } from 'react';
import { themes } from '../theme/colors';
import { apiFetch, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [themeMode, setThemeMode] = useState('light'); // 'light' or 'dark'
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [deviceId, setDeviceId] = useState('DEV_AKTU_ANDROID_99');

  const theme = themes[themeMode];

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = async (identifier, password, role) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, role, deviceId })
    });

    if (res.success) {
      setUser(res.user);
      setAuthToken(res.token);
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        theme,
        themeMode,
        toggleTheme,
        biometricsEnabled,
        setBiometricsEnabled,
        deviceId,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
