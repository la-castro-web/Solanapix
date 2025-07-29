# 🌟 SolanaPix - Solana Mobile Hackathon

> **Language:** [🇧🇷 Português](README.md) | [🇺🇸 English](README_EN.md)

**SolanaPix** is a complete solution for USDC payments via Solana Pay, designed especially for the Brazilian market. The project allows receiving payments in USDC and converting values in Brazilian Real (BRL) intuitively, working both as a mobile app and webapp.

## 🚀 Demo

- **Webapp:** [solanapix-webapp.herokuapp.com](https://solanapix-webapp.herokuapp.com)
- **Features:** Payment reception via Solana Pay QR Code, BRL→USDC conversion, Magic Link authentication

## 📱 Architecture

### Frontend (Next.js + React)
- **Webapp**: Main interface for generating QR Codes and managing balance
- **Mobile**: React Native/Expo native app that loads the webapp via WebView

### Technologies
- **Blockchain:** Solana Mainnet
- **Payments:** Solana Pay Protocol
- **Token:** USDC (SPL Token)
- **Authentication:** Magic Link with Solana extension
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Mobile:** React Native, Expo
- **Deploy:** Heroku (webapp), Expo (mobile)

## 🛠️ Features

### ✅ Implemented
- 🔐 **Magic Link Authentication** - Passwordless login, automatic Solana wallet
- 💰 **Solana Pay QR Code Generation** - USDC payments with BRL conversion
- 📊 **Balance Dashboard** - USDC and SOL visualization in BRL
- 📱 **Native Mobile App** - React Native wrapper for mobile experience
- 🔄 **Manual Balance Update** - Button to refresh balances
- 💱 **Currency Conversion** - BRL→USDC using real-time exchange rates

### 🚧 In Development
- 🏦 PIX withdrawal (USDC→BRL conversion)
- 📨 Payment received notifications
- 📈 Transaction history
- 🔔 Real-time update webhooks

## 🏗️ Project Structure

```
SolanaPix/
├── webapp/                 # Next.js App (Main interface)
│   ├── src/
│   │   ├── app/            # App Router (Next.js 13+)
│   │   ├── components/     # React Components
│   │   │   ├── BalanceDisplay.tsx
│   │   │   └── SolanaPayQRCode.tsx
│   │   └── contexts/       # Context API
│   │       └── AuthContext.tsx
│   ├── package.json
│   └── .env.local          # Environment variables
├── App.tsx                 # React Native App (Mobile)
├── app.json               # Expo configuration
├── assets/                # Icons and images
└── README.md
```

## 🚦 How to Run

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- Magic Link account
- Solana RPC (Helius, QuickNode, etc.)

### 1. Clone Repository
```bash
git clone https://github.com/la-castro-web/Solanapix.git
cd Solanapix
```

### 2. Setup Webapp
```bash
cd webapp
npm install

# Create .env.local with your keys:
# NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY=your_magic_publishable_key
# NEXT_PUBLIC_SOLANA_RPC_URL=your_solana_rpc_url
# NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta

npm run dev
```

### 3. Run Mobile App
```bash
# In root directory
npm install
npm start

# To run on device:
npm run android  # Android
npm run ios      # iOS (macOS only)
```

## 🔧 Configuration

### Magic Link
1. Create account at [magic.link](https://magic.link)
2. Configure Solana extension for Mainnet
3. Add publishable key to `.env.local`

### Solana RPC
1. Create account at [Helius](https://helius.xyz) (recommended)
2. Get your API key
3. Configure URL in `.env.local`:
   ```
   NEXT_PUBLIC_SOLANA_RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_API_KEY
   ```

## 💡 How to Use

### To Receive Payments
1. Login with your email (Magic Link)
2. Enter amount in Brazilian Reals (BRL)
3. Generate Solana Pay QR Code
4. Share with the payer
5. Payer scans with Solana wallet (Phantom, Solflare, etc.)

### To Pay
1. Open your favorite Solana wallet
2. Scan the generated QR Code
3. Confirm USDC payment
4. Transaction processed on Solana

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

## 🤝 Contributing

This project was developed for the **Solana Mobile Hackathon**. Contributions are welcome!

1. Fork the project
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 👨‍💻 Developer

Developed by **Lucas Castro** for the Solana Mobile Hackathon 2025.

- 🐙 GitHub: [@la-castro-web](https://github.com/la-castro-web)
- 🌐 Demo: [solanapix-webapp.herokuapp.com](https://solanapix-webapp.herokuapp.com)

---

## 🏆 Solana Mobile Hackathon

This project was created to demonstrate:
- Solana Pay integration in mobile applications
- Brazilian user experience (BRL→USDC)
- Magic Link for frictionless onboarding
- Hybrid architecture (webapp + native mobile)

**#SolanaMobile #SolanaPay #Hackathon #USDC #Brazil** 