// Configuração Web3Auth para produção
export const WEB3AUTH_CONFIG = {
  clientId: 'BCkUlQdRJNwm37OrrF9tqWX7SKB7Z9CK8baGTKFPc69saHVVf1hFtns5GresgPduz2TiqFrjAIaiSj8V2vGffe0',
  web3AuthNetwork: 'sapphire_mainnet',
  chainConfig: {
    chainId: '0x1',
    rpcTarget: 'https://api.mainnet-beta.solana.com',
    displayName: 'Solana Mainnet',
    blockExplorer: 'https://explorer.solana.com',
    ticker: 'SOL',
    tickerName: 'Solana',
  },
  uiConfig: {
    theme: 'dark',
    loginMethodsOrder: ['google', 'facebook', 'twitter', 'discord'],
    defaultLanguage: 'pt',
    appLogo: 'https://web3auth.io/images/w3a-L-Favicon-1.svg',
  },
};

// Configuração para desenvolvimento/teste
export const WEB3AUTH_CONFIG_DEVNET = {
  ...WEB3AUTH_CONFIG,
  web3AuthNetwork: 'sapphire_devnet',
  chainConfig: {
    ...WEB3AUTH_CONFIG.chainConfig,
    chainId: '0x2',
    rpcTarget: 'https://api.devnet.solana.com',
    displayName: 'Solana Devnet',
  },
};

// Opções de login social disponíveis
export const LOGIN_PROVIDERS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  DISCORD: 'discord',
  GITHUB: 'github',
  EMAIL_PASSWORDLESS: 'email_passwordless',
}; 