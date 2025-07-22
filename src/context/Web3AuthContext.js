import React, { createContext, useContext, useState, useEffect } from 'react';
import Web3Auth from '@web3auth/react-native-sdk';
import { SolanaWallet } from '@web3auth/solana-provider';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import * as SecureStore from 'expo-secure-store';
import { WEB3AUTH_CONFIG, WEB3AUTH_CONFIG_DEVNET } from '../config/web3auth';

const Web3AuthContext = createContext();

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error('useWeb3Auth deve ser usado dentro de Web3AuthProvider');
  }
  return context;
};

export const Web3AuthProvider = ({ children, isDevelopment = true }) => {
  const [web3auth, setWeb3auth] = useState(null);
  const [user, setUser] = useState(null);
  const [solanaWallet, setSolanaWallet] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [connection, setConnection] = useState(null);

  const config = isDevelopment ? WEB3AUTH_CONFIG_DEVNET : WEB3AUTH_CONFIG;

  useEffect(() => {
    initializeWeb3Auth();
  }, []);

  const initializeWeb3Auth = async () => {
    try {
      setIsLoading(true);

      const web3authInstance = new Web3Auth({
        clientId: config.clientId,
        network: config.web3AuthNetwork,
        chainConfig: {
          chainNamespace: 'solana',
          chainId: config.chainConfig.chainId,
          rpcTarget: config.chainConfig.rpcTarget,
          displayName: config.chainConfig.displayName,
          blockExplorer: config.chainConfig.blockExplorer,
          ticker: config.chainConfig.ticker,
          tickerName: config.chainConfig.tickerName,
        },
        loginConfig: {
          google: {
            verifier: 'google',
            typeOfLogin: 'google',
            clientId: config.clientId,
          },
        },
      });

      await web3authInstance.init();
      setWeb3auth(web3authInstance);

      // Criar conexão com Solana
      const solanaConnection = new Connection(config.chainConfig.rpcTarget);
      setConnection(solanaConnection);

      // Verificar se já está logado
      if (web3authInstance.connected) {
        await handlePostLogin(web3authInstance);
      }

      console.log('Web3Auth inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar Web3Auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostLogin = async (web3authInstance) => {
    try {
      const userInfo = await web3authInstance.getUserInfo();
      setUser(userInfo);
      setIsLoggedIn(true);

      // Criar carteira Solana
      const solanaProvider = web3authInstance.provider;
      const wallet = new SolanaWallet(solanaProvider);
      setSolanaWallet(wallet);

      // Obter endereço público
      const accounts = await wallet.requestAccounts();
      const pubKey = new PublicKey(accounts[0]);
      setPublicKey(pubKey);

      // Buscar saldo
      await updateBalance(pubKey);

      // Salvar sessão de forma segura
      await SecureStore.setItemAsync('web3auth_session', JSON.stringify({
        isLoggedIn: true,
        userInfo: userInfo,
        publicKey: pubKey.toString(),
      }));

      console.log('Login realizado com sucesso:', userInfo);
    } catch (error) {
      console.error('Erro no pós-login:', error);
    }
  };

  const login = async (loginProvider = 'google') => {
    try {
      if (!web3auth) {
        throw new Error('Web3Auth não inicializado');
      }

      setIsLoading(true);
      await web3auth.login({ loginProvider });
      await handlePostLogin(web3auth);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (!web3auth) {
        return;
      }

      setIsLoading(true);
      await web3auth.logout();
      
      // Limpar estado
      setUser(null);
      setIsLoggedIn(false);
      setSolanaWallet(null);
      setPublicKey(null);
      setBalance(0);

      // Remover sessão salva
      await SecureStore.deleteItemAsync('web3auth_session');
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBalance = async (pubKey = publicKey) => {
    try {
      if (!connection || !pubKey) return;

      const balanceInLamports = await connection.getBalance(pubKey);
      const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
      setBalance(balanceInSol);
    } catch (error) {
      console.error('Erro ao buscar saldo:', error);
    }
  };

  const sendTransaction = async (recipientAddress, amountInSol) => {
    try {
      if (!solanaWallet || !publicKey) {
        throw new Error('Carteira não conectada');
      }

      setIsLoading(true);

      const transaction = await solanaWallet.sendTransaction({
        to: recipientAddress,
        value: (amountInSol * LAMPORTS_PER_SOL).toString(),
      });

      // Aguardar confirmação
      await connection.confirmTransaction(transaction);
      
      // Atualizar saldo após transação
      await updateBalance();

      return transaction;
    } catch (error) {
      console.error('Erro ao enviar transação:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getPrivateKey = async () => {
    try {
      if (!web3auth) {
        throw new Error('Web3Auth não inicializado');
      }

      const privateKey = await web3auth.provider.request({
        method: 'private_key',
      });

      return privateKey;
    } catch (error) {
      console.error('Erro ao obter chave privada:', error);
      throw error;
    }
  };

  const value = {
    web3auth,
    user,
    solanaWallet,
    publicKey,
    balance,
    isLoading,
    isLoggedIn,
    connection,
    login,
    logout,
    updateBalance,
    sendTransaction,
    getPrivateKey,
  };

  return (
    <Web3AuthContext.Provider value={value}>
      {children}
    </Web3AuthContext.Provider>
  );
}; 