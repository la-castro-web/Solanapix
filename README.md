# 🌟 SolanaPix - Solana Mobile Hackathon

> **Language:** [🇧🇷 Português](README.md) | [🇺🇸 English](README_EN.md)

**SolanaPix** é uma solução completa para pagamentos em USDC via Solana Pay, pensada especialmente para o mercado brasileiro. O projeto permite receber pagamentos em USDC e converter valores em Real (BRL) de forma intuitiva, funcionando tanto como aplicativo móvel quanto webapp.

## 🚀 Demo

- **Funcionalidades:** Recebimento de pagamentos via QR Code Solana Pay, conversão BRL→USDC, autenticação via Magic Link

## 📱 Arquitetura

### Frontend (Next.js + React)
- **Webapp**: Interface principal para gerar QR Codes e gerenciar saldo
- **Mobile**: App nativo React Native/Expo que carrega a webapp via WebView

### Tecnologias
- **Blockchain:** Solana Mainnet
- **Pagamentos:** Solana Pay Protocol
- **Token:** USDC (SPL Token)
- **Autenticação:** Magic Link com extensão Solana
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Mobile:** React Native, Expo
- **Deploy:** Heroku (webapp), Expo (mobile)

## 🛠️ Funcionalidades

### ✅ Implementadas
- 🔐 **Autenticação via Magic Link** - Login sem senha, carteira Solana automática
- 💰 **Geração de QR Code Solana Pay** - Pagamentos em USDC com conversão BRL
- 📊 **Dashboard de Saldo** - Visualização de USDC e SOL em BRL
- 📱 **App Mobile Nativo** - Wrapper React Native para experiência mobile
- 🔄 **Atualização Manual de Saldo** - Botão para atualizar saldos
- 💱 **Conversão de Moeda** - BRL→USDC usando cotação em tempo real

### 🚧 Em Desenvolvimento
- 🏦 Saque via PIX (conversão USDC→BRL)
- 📨 Notificações de pagamento recebido
- 📈 Histórico de transações
- 🔔 Webhooks para atualizações em tempo real

## 🏗️ Estrutura do Projeto

```
SolanaPix/
├── webapp/                 # Next.js App (Interface principal)
│   ├── src/
│   │   ├── app/            # App Router (Next.js 13+)
│   │   ├── components/     # Componentes React
│   │   │   ├── BalanceDisplay.tsx
│   │   │   └── SolanaPayQRCode.tsx
│   │   └── contexts/       # Context API
│   │       └── AuthContext.tsx
│   ├── package.json
│   └── .env.local          # Variáveis de ambiente
├── App.tsx                 # App React Native (Mobile)
├── app.json               # Configuração Expo
├── assets/                # Ícones e imagens
└── README.md
```

## 🚦 Como Executar

### Pré-requisitos
- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- Conta Magic Link
- RPC Solana (Helius, QuickNode, etc.)

### 1. Clonar o Repositório
```bash
git clone https://github.com/la-castro-web/Solanapix.git
cd Solanapix
```

### 2. Configurar Webapp
```bash
cd webapp
npm install

# Criar .env.local com suas chaves:
# NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY=sua_magic_publishable_key
# NEXT_PUBLIC_SOLANA_RPC_URL=sua_rpc_url_solana
# NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta

npm run dev
```

### 3. Executar Mobile App
```bash
# Na pasta raiz
npm install
npm start

# Para executar em dispositivo:
npm run android  # Android
npm run ios      # iOS (apenas macOS)
```

## 🔧 Configuração

### Magic Link
1. Crie conta em [magic.link](https://magic.link)
2. Configure extensão Solana para Mainnet
3. Adicione a publishable key no `.env.local`

### RPC Solana
1. Crie conta na [Helius](https://helius.xyz) (recomendado)
2. Obtenha sua API key
3. Configure a URL no `.env.local`:
   ```
   NEXT_PUBLIC_SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=SUA_API_KEY
   ```

## 💡 Como Usar

### Para Receber Pagamentos
1. Faça login com seu email (Magic Link)
2. Digite o valor em Reais (BRL)
3. Gere o QR Code Solana Pay
4. Compartilhe com quem vai pagar
5. O pagador escaneia com wallet Solana (Phantom, Solflare, etc.)

### Para Pagar
1. Abra sua wallet Solana favorita
2. Escaneie o QR Code gerado
3. Confirme o pagamento em USDC
4. Transação processada na Solana

## 🌐 Deploy

### Webapp (Heroku)
```bash
cd webapp
git add .
git commit -m "Deploy to Heroku"
git push heroku master
```

### Mobile (Expo)
```bash
expo build:android  # Android
expo build:ios      # iOS
```

## 🤝 Contribuindo

Este projeto foi desenvolvido para o **Solana Mobile Hackathon**. Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request


## 👨‍💻 Desenvolvedor

Desenvolvido por **Brahma** para o Solana Mobile Hackathon 2025.

- 🐙 GitHub: [@la-castro-web](https://github.com/la-castro-web)

---

## 🏆 Solana Mobile Hackathon

Este projeto foi criado para demonstrar:
- Integração Solana Pay em aplicações móveis
- Experiência de usuário brasileira (BRL→USDC)
- Magic Link para onboarding sem fricção
- Arquitetura híbrida (webapp + mobile nativo)

**#SolanaMobile #SolanaPay #Hackathon #USDC #Brasil** 