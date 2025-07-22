import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { Web3AuthProvider, useWeb3Auth } from './src/context/Web3AuthContext';
import LoginScreen from './src/components/LoginScreen';
import WalletScreen from './src/components/WalletScreen';

const AppContent = () => {
  const { isLoggedIn, isLoading, web3auth } = useWeb3Auth();

  // Mostrar loading enquanto o Web3Auth está inicializando
  if (!web3auth || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logo}>🚀</Text>
        <Text style={styles.loadingText}>SolanaPix</Text>
        <ActivityIndicator size="large" color="#7C3AED" style={styles.spinner} />
        <Text style={styles.loadingSubtext}>Inicializando carteira...</Text>
      </View>
    );
  }

  // Se logado, mostrar tela da carteira, senão mostrar login
  return isLoggedIn ? <WalletScreen /> : <LoginScreen />;
};

export default function App() {
  return (
    <Web3AuthProvider isDevelopment={true}>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#0F0F23" />
        <AppContent />
      </View>
    </Web3AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F23',
  },
  logo: {
    fontSize: 60,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 20,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#A0A0C4',
    textAlign: 'center',
  },
});
