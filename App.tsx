import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import CONFIG from './config';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  const handleLoadStart = () => {
    console.log('WebView: Iniciando carregamento de', CONFIG.WEBAPP_URL);
    setLoading(true);
    setError(false);
    setErrorDetails('');
  };

  const handleLoadEnd = () => {
    console.log('WebView: Carregamento concluído');
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView Error:', nativeEvent);
    setLoading(false);
    setError(true);
    setErrorDetails(`Erro: ${nativeEvent.description || 'Falha na conexão'}`);
  };

  const handleHttpError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView HTTP Error:', nativeEvent);
    setErrorDetails(`HTTP Error: ${nativeEvent.statusCode} - ${nativeEvent.description}`);
  };

  const handleMessage = (event: any) => {
    console.log('WebView Message:', event.nativeEvent.data);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Erro ao carregar o app</Text>
        <Text style={styles.errorMessage}>Tentando acessar</Text>
        <Text style={styles.errorDetails}>{errorDetails}</Text>
        <View style={styles.troubleshootContainer}>
          <Text style={styles.troubleshootTitle}>Possíveis soluções:</Text>
          <Text style={styles.troubleshootText}>
            • Verifique se a webapp está rodando{'\n'}
            • Execute: npm run dev na pasta webapp{'\n'}
            • Verifique se a porta 3000 está disponível
          </Text>
        </View>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Carregando {CONFIG.APP_NAME}...</Text>
          <Text style={styles.loadingUrl}>Conectando</Text>
        </View>
      )}
      <WebView
        source={{ uri: CONFIG.WEBAPP_URL }}
        style={styles.webview}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onHttpError={handleHttpError}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        allowsBackForwardNavigationGestures={false}
        incognito={false}
        cacheEnabled
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  loadingUrl: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  troubleshootContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  troubleshootTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  troubleshootText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
