import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Clipboard,
  Share,
} from 'react-native';
import { useWeb3Auth } from '../context/Web3AuthContext';

const WalletScreen = () => {
  const {
    user,
    publicKey,
    balance,
    isLoading,
    logout,
    updateBalance,
    sendTransaction,
  } = useWeb3Auth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);

  useEffect(() => {
    if (publicKey) {
      updateBalance();
    }
  }, [publicKey]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await updateBalance();
    setRefreshing(false);
  };

  const copyAddress = async () => {
    if (publicKey) {
      await Clipboard.setString(publicKey.toString());
      Alert.alert('Copiado!', 'Endereço da carteira copiado para a área de transferência');
    }
  };

  const shareAddress = async () => {
    if (publicKey) {
      try {
        await Share.share({
          message: `Meu endereço Solana: ${publicKey.toString()}`,
          title: 'Endereço da Carteira Solana',
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair da Carteira',
      'Tem certeza que deseja sair? Você precisará fazer login novamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const formatAddress = (address) => {
    if (!address) return '';
    const addressStr = address.toString();
    if (showFullAddress) return addressStr;
    return `${addressStr.slice(0, 4)}...${addressStr.slice(-4)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Olá, {user?.name || 'Usuário'}</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Total</Text>
          <Text style={styles.balanceAmount}>
            {balance.toFixed(4)} SOL
          </Text>
          <Text style={styles.balanceUSD}>
            ≈ ${(balance * 100).toFixed(2)} USD
          </Text>
        </View>

        {/* Address Card */}
        <View style={styles.addressCard}>
          <Text style={styles.addressLabel}>Endereço da Carteira</Text>
          <TouchableOpacity
            style={styles.addressContainer}
            onPress={() => setShowFullAddress(!showFullAddress)}
          >
            <Text style={styles.addressText}>
              {formatAddress(publicKey)}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.addressActions}>
            <TouchableOpacity style={styles.actionButton} onPress={copyAddress}>
              <Text style={styles.actionButtonText}>📋 Copiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={shareAddress}>
              <Text style={styles.actionButtonText}>📤 Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.quickAction} disabled>
              <Text style={styles.quickActionIcon}>💸</Text>
              <Text style={styles.quickActionText}>Enviar</Text>
              <Text style={styles.comingSoon}>Em breve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} disabled>
              <Text style={styles.quickActionIcon}>📥</Text>
              <Text style={styles.quickActionText}>Receber</Text>
              <Text style={styles.comingSoon}>Em breve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} disabled>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>Histórico</Text>
              <Text style={styles.comingSoon}>Em breve</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} disabled>
              <Text style={styles.quickActionIcon}>⚙️</Text>
              <Text style={styles.quickActionText}>Configurações</Text>
              <Text style={styles.comingSoon}>Em breve</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Sobre sua Carteira</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              🔐 <Text style={styles.infoLabel}>Semi-custodial:</Text> Você tem controle
              total sobre seus ativos através do Web3Auth.
            </Text>
            <Text style={styles.infoText}>
              ⚡ <Text style={styles.infoLabel}>Rede Solana:</Text> Transações rápidas
              e de baixo custo.
            </Text>
            <Text style={styles.infoText}>
              🔑 <Text style={styles.infoLabel}>Chave ED25519:</Text> Sua carteira
              usa criptografia de ponta.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#A0A0C4',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF4444',
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#1E1E3F',
    margin: 20,
    marginTop: 0,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#A0A0C4',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  balanceUSD: {
    fontSize: 16,
    color: '#A0A0C4',
  },
  addressCard: {
    backgroundColor: '#1E1E3F',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  addressContainer: {
    backgroundColor: '#2A2A4A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addressText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionsContainer: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: '#1E1E3F',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    opacity: 0.6,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  comingSoon: {
    fontSize: 12,
    color: '#A0A0C4',
  },
  infoSection: {
    margin: 20,
    marginTop: 0,
    marginBottom: 40,
  },
  infoCard: {
    backgroundColor: '#1E1E3F',
    padding: 20,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#A0A0C4',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default WalletScreen; 