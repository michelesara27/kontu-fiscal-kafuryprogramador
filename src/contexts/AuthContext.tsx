import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'collaborator';
  company: {
    id: string;
    fantasyName: string;
    cnpj: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
}

interface RegisterData {
  fantasyName: string;
  email: string;
  phone: string;
  cnpj: string;
  address: {
    street: string;
    neighborhood: string;
    zipCode: string;
    city: string;
    state: string;
  };
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock login - in real app, this would call your API
    if (email && password) {
      setUser({
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'admin',
        company: {
          id: '1',
          fantasyName: 'Escritório Contábil Demo',
          cnpj: '12.345.678/0001-90'
        }
      });
      return true;
    }
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock registration - in real app, this would call your API
    setUser({
      id: '1',
      email: userData.email,
      name: userData.fantasyName,
      role: 'admin',
      company: {
        id: '1',
        fantasyName: userData.fantasyName,
        cnpj: userData.cnpj
      }
    });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true; // Always succeed for demo
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
