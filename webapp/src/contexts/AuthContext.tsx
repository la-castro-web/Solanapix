'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Magic } from 'magic-sdk';
import { SolanaExtension } from '@magic-ext/solana';

// Configuração do Magic com extensão Solana
const magic = typeof window !== 'undefined' ? new Magic(
  process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!,
  {
    extensions: {
      solana: new SolanaExtension({
        rpcUrl: 'https://api.mainnet-beta.solana.com',
      }),
    },
  }
) : null;

interface User {
  email: string;
  publicAddress: string;
  issuer: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  magic: typeof magic;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!magic) {
        setIsLoading(false);
        return;
      }

      try {
        const isLoggedIn = await magic.user.isLoggedIn();
        if (isLoggedIn) {
          const metadata = await magic.user.getInfo();
          // Usar método correto para obter endereço Solana
          let publicAddress = metadata.publicAddress || 'N/A';
          try {
            const solanaExt = magic.solana as unknown;
            if (
              solanaExt &&
              typeof solanaExt === 'object' &&
              'getAccount' in solanaExt &&
              typeof (solanaExt as { getAccount: unknown }).getAccount === 'function'
            ) {
              publicAddress = await (solanaExt as { getAccount: () => Promise<string> }).getAccount();
            }
          } catch {
            // fallback já está em publicAddress
          }
          setUser({
            email: metadata.email!,
            publicAddress,
            issuer: metadata.issuer!,
          });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Fallback para endereço genérico se Solana falhar
        try {
          const metadata = await magic.user.getInfo();
          setUser({
            email: metadata.email!,
            publicAddress: metadata.publicAddress || 'N/A',
            issuer: metadata.issuer!,
          });
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string) => {
    if (!magic) throw new Error('Magic não está disponível');

    setIsLoading(true);
    try {
      await magic.auth.loginWithMagicLink({ email });
      const metadata = await magic.user.getInfo();
      
      // Tentar obter endereço Solana, com fallback
      let publicAddress = metadata.publicAddress || 'N/A';
      try {
        const solanaExt = magic.solana as unknown;
        if (
          solanaExt &&
          typeof solanaExt === 'object' &&
          'getAccount' in solanaExt &&
          typeof (solanaExt as { getAccount: unknown }).getAccount === 'function'
        ) {
          publicAddress = await (solanaExt as { getAccount: () => Promise<string> }).getAccount();
        }
      } catch {
        // fallback já está em publicAddress
      }
      
      setUser({
        email: metadata.email!,
        publicAddress: publicAddress,
        issuer: metadata.issuer!,
      });
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!magic) throw new Error('Magic não está disponível');

    setIsLoading(true);
    try {
      await magic.user.logout();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    magic,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 