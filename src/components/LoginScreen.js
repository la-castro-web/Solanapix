import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useWeb3Auth } from '../context/Web3AuthContext';
import { LOGIN_PROVIDERS } from '../config/web3auth';

const LoginScreen = () => {
  const { login, isLoading } = useWeb3Auth();
  const [selectedProvider, setSelectedProvider] = useState(null);

  const handleLogin = async (provider) => {
    try {
      setSelectedProvider(provider);
      await login(provider);
    } catch (error) {
      Alert.alert(
        'Erro no Login',
        error.message || 'Ocorreu um erro durante o login. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setSelectedProvider(null);
    }
  };

  const LoginButton = ({ provider, title, icon, color }) => (
    <TouchableOpacity
      style={[styles.loginButton, { backgroundColor: color }]}
      onPress={() => handleLogin(provider)}
      disabled={isLoading}
    >
      {selectedProvider === provider ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
          <Text style={styles.loginButtonText}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🚀</Text>
          </View>
          <Text style={styles.title}>SolanaPix</Text>
          <Text style={styles.subtitle}>
            Sua carteira semi-custodial na rede Solana
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureText}>Segurança avançada</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureText}>Transações rápidas</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Interface simples</Text>
          </View>
        </View>

        {/* Login Buttons */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Entre com sua conta social</Text>
          
          <LoginButton
            provider={LOGIN_PROVIDERS.GOOGLE}
            title="Continuar com Google"
            icon="G"
            color="#4285F4"
          />
          
          <LoginButton
            provider={LOGIN_PROVIDERS.FACEBOOK}
            title="Continuar com Facebook"
            icon="f"
            color="#1877F2"
          />
          
          <LoginButton
            provider={LOGIN_PROVIDERS.TWITTER}
            title="Continuar com Twitter"
            icon="𝕏"
            color="#1DA1F2"
          />
          
          <LoginButton
            provider={LOGIN_PROVIDERS.DISCORD}
            title="Continuar com Discord"
            icon="D"
            color="#5865F2"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ao continuar, você concorda com nossos{' '}
            <Text style={styles.link}>Termos de Uso</Text> e{' '}
            <Text style={styles.link}>Política de Privacidade</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E1E3F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0C4',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 40,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#A0A0C4',
    textAlign: 'center',
  },
  loginContainer: {
    paddingBottom: 40,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#A0A0C4',
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: '#7C3AED',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen; 