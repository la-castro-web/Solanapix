'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'pt' | 'en';

type TranslationKey = 
  | 'nav.home' | 'nav.receive' | 'nav.donate' | 'nav.withdraw' | 'nav.settings'
  | 'home.balance' | 'home.quickStats' | 'home.transactionHistory' | 'home.quickTip' | 'home.quickTipText' | 'home.totalReceived' | 'home.totalSent' | 'home.averageTx' | 'home.transactions' | 'home.yourBalance' | 'home.loadingBalance' | 'home.balanceError'
  | 'receive.title' | 'receive.description' | 'receive.amountLabel' | 'receive.amountPlaceholder' | 'receive.generateQR' | 'receive.supportedWallets' | 'receive.supportedWalletsDesc' | 'receive.value'
  | 'donations.title' | 'donations.description' | 'donations.selectToken' | 'donations.makeDonation' | 'donations.tokenValue' | 'donations.donationValue' | 'donations.conversionRate' | 'donations.availableBalance' | 'donations.donate' | 'donations.processing' | 'donations.howItWorks' | 'donations.howItWorks1' | 'donations.howItWorks2' | 'donations.howItWorks3' | 'donations.howItWorks4' | 'donations.howItWorks5' | 'donations.projectCategory' | 'donations.wallet' | 'donations.donationSuccess' | 'donations.donationError' | 'donations.invalidAmount' | 'donations.insufficientBalance' | 'donations.userNotLoggedIn'
  | 'withdraw.title' | 'withdraw.description' | 'withdraw.withdrawDetails' | 'withdraw.tokenValue' | 'withdraw.bankDetails' | 'withdraw.bankName' | 'withdraw.accountType' | 'withdraw.accountNumber' | 'withdraw.agency' | 'withdraw.cpf' | 'withdraw.accountHolder' | 'withdraw.valueToReceive' | 'withdraw.fee' | 'withdraw.conversionRate' | 'withdraw.requestWithdraw' | 'withdraw.processing' | 'withdraw.offrampInfo' | 'withdraw.offrampInfo1' | 'withdraw.offrampInfo2' | 'withdraw.offrampInfo3' | 'withdraw.offrampInfo4' | 'withdraw.offrampInfo5'
  | 'settings.title' | 'settings.description' | 'settings.language' | 'settings.languageDesc' | 'settings.portuguese' | 'settings.english' | 'settings.account' | 'settings.walletAddress' | 'settings.copyAddress' | 'settings.disconnect' | 'settings.about' | 'settings.version' | 'settings.aboutText' | 'settings.confirm' | 'settings.notConnected'
  | 'common.loading' | 'common.error' | 'common.success' | 'common.cancel' | 'common.max' | 'common.instagram' | 'common.email' | 'common.emailPlaceholder' | 'common.loginWithMagicLink' | 'common.sendingMagicLink' | 'common.magicLinkInstructions' | 'common.loginError' | 'common.loadingApp' | 'common.solanaPix' | 'common.solanaPayDescription' | 'common.totalBalance' | 'common.quickTip' | 'common.quickTipText' | 'common.projectName' | 'common.projectDescription' | 'common.helpUs' | 'common.followProject' | 'common.seeImpact' | 'common.completed' | 'common.pending' | 'common.failed' | 'common.unknown';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const translations: Record<Language, Record<TranslationKey, string>> = {
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.receive': 'Receber',
    'nav.donate': 'Doações',
    'nav.withdraw': 'Sacar',
    'nav.settings': 'Configurações',

    // Home
    'home.balance': 'Saldo Total',
    'home.quickStats': 'Estatísticas Rápidas',
    'home.transactionHistory': 'Histórico de Transações',
    'home.quickTip': 'Dica Rápida',
    'home.quickTipText': 'Use a aba "Receber" para gerar QR codes e aceitar pagamentos em USDC via Solana Pay.',
    'home.totalReceived': 'Total Recebido',
    'home.totalSent': 'Total Enviado',
    'home.averageTx': 'Média/Tx',
    'home.transactions': 'Transações',
    'home.yourBalance': 'Seu Saldo',
    'home.loadingBalance': 'Carregando saldo...',
    'home.balanceError': 'Erro ao buscar saldo. Tente novamente mais tarde.',

    // Receive
    'receive.title': 'Receber Pagamento',
    'receive.description': 'Gere QR codes para receber pagamentos via Solana Pay',
    'receive.amountLabel': 'Valor em Reais (BRL)',
    'receive.amountPlaceholder': '0.00',
    'receive.generateQR': 'Gerar QR Code',
    'receive.supportedWallets': 'Wallets Suportadas',
    'receive.supportedWalletsDesc': 'Escaneie o QR code com qualquer uma dessas wallets',
    'receive.value': 'Valor',

    // Donations
    'donations.title': 'Doações',
    'donations.description': 'Ajude projetos incríveis com doações diretas via Solana',
    'donations.selectToken': 'Selecionar Token',
    'donations.makeDonation': 'Fazer Doação',
    'donations.tokenValue': 'Valor em',
    'donations.donationValue': 'Valor da doação (BRL):',
    'donations.conversionRate': 'Taxa de conversão:',
    'donations.availableBalance': 'Saldo disponível:',
    'donations.donate': 'Doar',
    'donations.processing': 'Processando doação...',
    'donations.howItWorks': 'Como funciona:',
    'donations.howItWorks1': 'Doações são enviadas diretamente para a wallet do projeto',
    'donations.howItWorks2': 'Transações são transparentes e verificáveis na blockchain',
    'donations.howItWorks3': 'Taxas de rede são mínimas (apenas custos da Solana)',
    'donations.howItWorks4': '100% do valor vai para o projeto',
    'donations.howItWorks5': 'Acompanhe o projeto no Instagram para ver o impacto',
    'donations.projectCategory': 'Animais',
    'donations.wallet': 'Wallet:',
    'donations.donationSuccess': 'Doação de {amount} {token} enviada com sucesso para {project}! Hash: {hash}...',
    'donations.donationError': 'Erro ao realizar doação',
    'donations.invalidAmount': 'Valor inválido',
    'donations.insufficientBalance': 'Saldo insuficiente',
    'donations.userNotLoggedIn': 'Usuário não está logado. Por favor, faça login primeiro.',

    // Withdraw
    'withdraw.title': 'Saque',
    'withdraw.description': 'Converta seus tokens para reais e receba em sua conta bancária',
    'withdraw.withdrawDetails': 'Detalhes do Saque',
    'withdraw.tokenValue': 'Valor em',
    'withdraw.bankDetails': 'Dados Bancários',
    'withdraw.bankName': 'Nome do banco',
    'withdraw.accountType': 'Tipo de conta (Corrente/Poupança)',
    'withdraw.accountNumber': 'Número da conta',
    'withdraw.agency': 'Agência',
    'withdraw.cpf': 'CPF do titular',
    'withdraw.accountHolder': 'Nome completo do titular',
    'withdraw.valueToReceive': 'Valor a receber (BRL):',
    'withdraw.fee': 'Taxa: 2.5%',
    'withdraw.conversionRate': 'Taxa de conversão:',
    'withdraw.requestWithdraw': 'Solicitar saque de',
    'withdraw.processing': 'Processando saque...',
    'withdraw.offrampInfo': 'Informações do Offramp:',
    'withdraw.offrampInfo1': 'Taxa de conversão: 2.5%',
    'withdraw.offrampInfo2': 'Prazo de processamento: 1-3 dias úteis',
    'withdraw.offrampInfo3': 'Valor mínimo: R$ 10,00',
    'withdraw.offrampInfo4': 'Valor máximo: R$ 10.000,00 por dia',
    'withdraw.offrampInfo5': 'Transferência via PIX ou TED',

    // Settings
    'settings.title': 'Configurações',
    'settings.description': 'Gerencie suas preferências e configurações da conta',
    'settings.language': 'Idioma',
    'settings.languageDesc': 'Escolha o idioma do aplicativo',
    'settings.portuguese': 'Português',
    'settings.english': 'English',
    'settings.account': 'Conta',
    'settings.walletAddress': 'Endereço da Carteira',
    'settings.copyAddress': 'Copiar Endereço',
    'settings.disconnect': 'Desconectar',
    'settings.about': 'Sobre',
    'settings.version': 'Versão',
    'settings.aboutText': 'SolanaPix - Plataforma de pagamentos via Solana',
    'settings.confirm': 'Confirmar',
    'settings.notConnected': 'Não conectado',

    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.cancel': 'Cancelar',
    'common.max': 'MAX',
    'common.instagram': 'Instagram',
    'common.email': 'Email',
    'common.emailPlaceholder': 'seu@email.com',
    'common.loginWithMagicLink': 'Entrar com Magic Link',
    'common.sendingMagicLink': 'Enviando link mágico...',
    'common.magicLinkInstructions': 'Um link será enviado para seu email. Clique no link para fazer login.',
    'common.loginError': 'Erro ao fazer login. Tente novamente.',
    'common.loadingApp': 'Carregando...',
    'common.solanaPix': 'SolanaPix',
    'common.solanaPayDescription': 'Pagamentos em USDC via Solana Pay',
    'common.totalBalance': 'Saldo Total',
    'common.quickTip': 'Dica Rápida',
    'common.quickTipText': 'Use a aba "Receber" para gerar QR codes e aceitar pagamentos em USDC via Solana Pay.',
    'common.projectName': 'Resgatando Vidas 4 Patas',
    'common.projectDescription': 'Projeto que acolhe gatinhos em situação de rua, cuida deles e os coloca para adoção. Ajude-nos a dar uma nova chance para esses animais que precisam de amor e cuidado.',
    'common.helpUs': 'Ajude-nos a dar uma nova chance para esses animais que precisam de amor e cuidado.',
    'common.followProject': 'Acompanhe o projeto no Instagram para ver o impacto',
    'common.seeImpact': 'ver o impacto',
    'common.completed': 'Completado',
    'common.pending': 'Pendente',
    'common.failed': 'Falhou',
    'common.unknown': 'Desconhecido',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.receive': 'Receive',
    'nav.donate': 'Donations',
    'nav.withdraw': 'Withdraw',
    'nav.settings': 'Settings',

    // Home
    'home.balance': 'Total Balance',
    'home.quickStats': 'Quick Stats',
    'home.transactionHistory': 'Transaction History',
    'home.quickTip': 'Quick Tip',
    'home.quickTipText': 'Use the "Receive" tab to generate QR codes and accept USDC payments via Solana Pay.',
    'home.totalReceived': 'Total Received',
    'home.totalSent': 'Total Sent',
    'home.averageTx': 'Average/Tx',
    'home.transactions': 'Transactions',
    'home.yourBalance': 'Your Balance',
    'home.loadingBalance': 'Loading balance...',
    'home.balanceError': 'Error loading balance. Please try again later.',

    // Receive
    'receive.title': 'Receive Payment',
    'receive.description': 'Generate QR codes to receive payments via Solana Pay',
    'receive.amountLabel': 'Amount in Reais (BRL)',
    'receive.amountPlaceholder': '0.00',
    'receive.generateQR': 'Generate QR Code',
    'receive.supportedWallets': 'Supported Wallets',
    'receive.supportedWalletsDesc': 'Scan the QR code with any of these wallets',
    'receive.value': 'Value',

    // Donations
    'donations.title': 'Donations',
    'donations.description': 'Help amazing projects with direct donations via Solana',
    'donations.selectToken': 'Select Token',
    'donations.makeDonation': 'Make Donation',
    'donations.tokenValue': 'Value in',
    'donations.donationValue': 'Donation value (BRL):',
    'donations.conversionRate': 'Conversion rate:',
    'donations.availableBalance': 'Available balance:',
    'donations.donate': 'Donate',
    'donations.processing': 'Processing donation...',
    'donations.howItWorks': 'How it works:',
    'donations.howItWorks1': 'Donations are sent directly to the project wallet',
    'donations.howItWorks2': 'Transactions are transparent and verifiable on the blockchain',
    'donations.howItWorks3': 'Network fees are minimal (only Solana costs)',
    'donations.howItWorks4': '100% of the value goes to the project',
    'donations.howItWorks5': 'Follow the project on Instagram to see the impact',
    'donations.projectCategory': 'Animals',
    'donations.wallet': 'Wallet:',
    'donations.donationSuccess': 'Donation of {amount} {token} sent successfully to {project}! Hash: {hash}...',
    'donations.donationError': 'Error processing donation',
    'donations.invalidAmount': 'Invalid amount',
    'donations.insufficientBalance': 'Insufficient balance',
    'donations.userNotLoggedIn': 'User is not logged in. Please login first.',

    // Withdraw
    'withdraw.title': 'Withdraw',
    'withdraw.description': 'Convert your tokens to reais and receive in your bank account',
    'withdraw.withdrawDetails': 'Withdrawal Details',
    'withdraw.tokenValue': 'Value in',
    'withdraw.bankDetails': 'Bank Details',
    'withdraw.bankName': 'Bank name',
    'withdraw.accountType': 'Account type (Checking/Savings)',
    'withdraw.accountNumber': 'Account number',
    'withdraw.agency': 'Agency',
    'withdraw.cpf': 'CPF of holder',
    'withdraw.accountHolder': 'Full name of holder',
    'withdraw.valueToReceive': 'Value to receive (BRL):',
    'withdraw.fee': 'Fee: 2.5%',
    'withdraw.conversionRate': 'Conversion rate:',
    'withdraw.requestWithdraw': 'Request withdrawal of',
    'withdraw.processing': 'Processing withdrawal...',
    'withdraw.offrampInfo': 'Offramp Information:',
    'withdraw.offrampInfo1': 'Conversion fee: 2.5%',
    'withdraw.offrampInfo2': 'Processing time: 1-3 business days',
    'withdraw.offrampInfo3': 'Minimum value: R$ 10.00',
    'withdraw.offrampInfo4': 'Maximum value: R$ 10,000.00 per day',
    'withdraw.offrampInfo5': 'Transfer via PIX or TED',

    // Settings
    'settings.title': 'Settings',
    'settings.description': 'Manage your account preferences and settings',
    'settings.language': 'Language',
    'settings.languageDesc': 'Choose the app language',
    'settings.portuguese': 'Português',
    'settings.english': 'English',
    'settings.account': 'Account',
    'settings.walletAddress': 'Wallet Address',
    'settings.copyAddress': 'Copy Address',
    'settings.disconnect': 'Disconnect',
    'settings.about': 'About',
    'settings.version': 'Version',
    'settings.aboutText': 'SolanaPix - Solana payment platform',
    'settings.confirm': 'Confirm',
    'settings.notConnected': 'Not connected',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.max': 'MAX',
    'common.instagram': 'Instagram',
    'common.email': 'Email',
    'common.emailPlaceholder': 'your@email.com',
    'common.loginWithMagicLink': 'Login with Magic Link',
    'common.sendingMagicLink': 'Sending magic link...',
    'common.magicLinkInstructions': 'A link will be sent to your email. Click the link to login.',
    'common.loginError': 'Login error. Please try again.',
    'common.loadingApp': 'Loading...',
    'common.solanaPix': 'SolanaPix',
    'common.solanaPayDescription': 'USDC payments via Solana Pay',
    'common.totalBalance': 'Total Balance',
    'common.quickTip': 'Quick Tip',
    'common.quickTipText': 'Use the "Receive" tab to generate QR codes and accept USDC payments via Solana Pay.',
    'common.projectName': 'Resgatando Vidas 4 Patas',
    'common.projectDescription': 'Project that welcomes street cats, takes care of them and puts them up for adoption. Help us give a new chance to these animals that need love and care.',
    'common.helpUs': 'Help us give a new chance to these animals that need love and care.',
    'common.followProject': 'Follow the project on Instagram to see the impact',
    'common.seeImpact': 'see the impact',
    'common.completed': 'Completed',
    'common.pending': 'Pending',
    'common.failed': 'Failed',
    'common.unknown': 'Unknown',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 