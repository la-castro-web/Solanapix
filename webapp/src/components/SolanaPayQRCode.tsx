'use client';
import React, { useState } from 'react';
import { encodeURL } from '@solana/pay';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import QRCode from 'react-qr-code';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Função para buscar cotação BRL→USDC (dinâmica via Binance)
async function fetchBRLtoUSDC(brl: number): Promise<number> {
  try {
    // Usar Binance API que não tem CORS
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDCUSDT');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const usdcToUsdt = parseFloat(data.price);
    
    // Converter USDT para BRL (aproximação)
    const usdtToBrl = 5.5; // Taxa aproximada USDT/BRL
    const usdcToBrl = usdcToUsdt * usdtToBrl;
    
    console.log('USDC to BRL rate:', usdcToBrl, 'BRL amount:', brl, 'USDC result:', brl / usdcToBrl);
    return brl / usdcToBrl;
  } catch {
    // Fallback: se a API falhar, usar cotação fixa
    console.log('Using fallback rate for USDC. BRL amount:', brl, 'USDC result:', brl / 5.5);
    return brl / 5.5; // 1 USDC ≈ R$ 5.50
  }
}

// Função para buscar cotação BRL→SOL (dinâmica via Binance)
async function fetchBRLtoSOL(brl: number): Promise<number> {
  try {
    // Usar Binance API que não tem CORS
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const solToUsdt = parseFloat(data.price);
    
    // Converter USDT para BRL (aproximação)
    const usdtToBrl = 5.5; // Taxa aproximada USDT/BRL
    const solToBrl = solToUsdt * usdtToBrl;
    
    console.log('SOL to BRL rate:', solToBrl, 'BRL amount:', brl, 'SOL result:', brl / solToBrl);
    return brl / solToBrl;
  } catch {
    // Fallback: se a API falhar, usar cotação fixa
    console.log('Using fallback rate for SOL. BRL amount:', brl, 'SOL result:', brl / 890);
    return brl / 890; // 1 SOL ≈ R$ 890
  }
}

// Função para buscar cotação BRL→BONK (dinâmica via Binance)
async function fetchBRLtoBONK(brl: number): Promise<number> {
  try {
    // Usar Binance API que não tem CORS
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BONKUSDT');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const bonkToUsdt = parseFloat(data.price);
    
    // Converter USDT para BRL (aproximação)
    const usdtToBrl = 5.5; // Taxa aproximada USDT/BRL
    const bonkToBrl = bonkToUsdt * usdtToBrl;
    
    console.log('BONK to BRL rate:', bonkToBrl, 'BRL amount:', brl, 'BONK result:', brl / bonkToBrl);
    return brl / bonkToBrl;
  } catch {
    // Fallback: se a API falhar, usar cotação fixa
    console.log('Using fallback rate for BONK. BRL amount:', brl, 'BONK result:', brl / 0.000001);
    return brl / 0.000001; // 1 BONK ≈ R$ 0.000001
  }
}

type TokenType = 'SOL' | 'USDC' | 'BONK';

interface TokenConfig {
  name: string;
  mint: string;
  decimals: number;
  color: string;
  icon: string;
}

const TOKEN_CONFIGS: Record<TokenType, TokenConfig> = {
  SOL: {
    name: 'Solana',
    mint: 'So11111111111111111111111111111111111111112', // SOL nativo
    decimals: 9,
    color: 'from-purple-600 to-cyan-600',
    icon: '🟣'
  },
  USDC: {
    name: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    color: 'from-blue-600 to-green-600',
    icon: '💙'
  },
  BONK: {
    name: 'BONK',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    decimals: 5,
    color: 'from-orange-600 to-yellow-600',
    icon: '🐕'
  }
};

export default function SolanaPayQRCode() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [brl, setBrl] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenType>('USDC');
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [displayValue, setDisplayValue] = useState<string>('');

  const handleGenerate = async (tokenType: TokenType) => {
    console.log('Gerar QR Code clicado', { brl, tokenType, user });
    setError('');
    if (!user?.publicAddress) {
      setError('Usuário não autenticado');
      return;
    }

    if (!brl || isNaN(parseFloat(brl)) || parseFloat(brl) <= 0) {
      setError('Valor inválido');
      return;
    }

    setLoading(true);
    try {
      const brlValue = parseFloat(brl);
      let tokenValue: number;

      console.log('Input BRL value:', brlValue);

      // Buscar cotação baseada no token selecionado
      switch (tokenType) {
        case 'USDC':
          tokenValue = await fetchBRLtoUSDC(brlValue);
          break;
        case 'SOL':
          tokenValue = await fetchBRLtoSOL(brlValue);
          break;
        case 'BONK':
          tokenValue = await fetchBRLtoBONK(brlValue);
          break;
        default:
          throw new Error('Token não suportado');
      }

      console.log('Token value before encoding:', tokenValue);
      console.log('Token type:', tokenType);
      console.log('Decimals:', TOKEN_CONFIGS[tokenType].decimals);

      // Criar URL do Solana Pay
      const recipient = new PublicKey(user.publicAddress);
      const amount = new BigNumber(tokenValue);
      const decimals = TOKEN_CONFIGS[tokenType].decimals;
      const splToken = tokenType !== 'SOL' ? new PublicKey(TOKEN_CONFIGS[tokenType].mint) : undefined;

      console.log('Recipient:', recipient.toString());
      console.log('Amount:', amount.toString());
      console.log('SPL Token:', splToken?.toString());

      // Conforme especificação Solana Pay: usar "user units" (SOL, USDC), NÃO lamports/micro-unidades
      // Limitar casas decimais para evitar problemas de precisão
      const finalAmount = new BigNumber(tokenValue.toFixed(6));
      console.log('Final amount for Solana Pay:', finalAmount.toString());

      // Estrutura mais simples para debug
      const encodeParams: {
        recipient: PublicKey;
        amount: BigNumber;
        splToken?: PublicKey;
        label?: string;
        message?: string;
        memo?: string;
      } = {
        recipient,
        amount: finalAmount,
        label: 'SolanaPix',
        message: `Pagamento de R$ ${brlValue.toFixed(2)} via SolanaPix`,
        memo: `Pix${tokenType}`,
      };

      // Só adicionar splToken se não for SOL
      if (tokenType !== 'SOL' && splToken) {
        encodeParams.splToken = splToken;
        console.log('Adding SPL Token to params');
      } else {
        console.log('Using SOL transfer (no SPL token)');
      }

      console.log('Encode params:', encodeParams);

      try {
        const url = encodeURL(encodeParams);
        console.log('Generated URL:', url.toString());
        setQrUrl(url.toString());
      } catch (encodeError) {
        console.error('Error encoding URL:', encodeError);
        throw encodeError;
      }

      setSelectedToken(tokenType);
      setDisplayValue(`${tokenValue.toFixed(6)} ${tokenType}`);
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
      setError(err instanceof Error ? err.message : 'Erro ao gerar QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (qrUrl) {
      try {
        await navigator.clipboard.writeText(qrUrl);
        // Você pode adicionar um toast aqui
      } catch (err) {
        console.error('Erro ao copiar URL:', err);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('receive.amountLabel')}
          </label>
          <div className="relative">
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              type="number"
              min="0.01"
              step="0.01"
              placeholder={t('receive.amountPlaceholder')}
              value={brl}
              onChange={e => setBrl(e.target.value)}
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              R$
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Botões de opções de pagamento */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            key="SOL"
            type="button"
            disabled={loading || !brl}
            onClick={() => handleGenerate('SOL')}
            className={`w-full py-3 px-4 rounded-xl transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 text-white font-semibold ${
              selectedToken === 'SOL' ? 'ring-4 ring-purple-300 scale-105 shadow-lg' : ''
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <Image
                src="/Solana_logo.png"
                alt="Solana"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-xs">SOL</span>
            </div>
          </Button>
          
          <Button
            key="USDC"
            type="button"
            disabled={loading || !brl}
            onClick={() => handleGenerate('USDC')}
            className={`w-full py-3 px-4 rounded-xl transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white font-semibold ${
              selectedToken === 'USDC' ? 'ring-4 ring-blue-300 scale-105 shadow-lg' : ''
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <Image
                src="/usdc.png"
                alt="USDC"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-xs">USDC</span>
            </div>
          </Button>
          
          <Button
            key="BONK"
            type="button"
            disabled={loading || !brl}
            onClick={() => handleGenerate('BONK')}
            className={`w-full py-3 px-4 rounded-xl transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed bg-gradient-to-r from-orange-600 to-yellow-600 hover:opacity-90 text-white font-semibold ${
              selectedToken === 'BONK' ? 'ring-4 ring-orange-300 scale-105 shadow-lg' : ''
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <Image
                src="/bonk.png"
                alt="BONK"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-xs">BONK</span>
            </div>
          </Button>
        </div>
      </form>

      {qrUrl && (
        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <QrCode size={20} className="text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">QR Code Solana Pay</h3>
            </div>
            <p className="text-sm text-gray-600">
              {t('receive.value')}: <span className="font-medium text-green-600">{displayValue}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {TOKEN_CONFIGS[selectedToken].name}
            </p>
          </div>
          
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 relative">
              <QRCode value={qrUrl} size={200} />
              {/* Logo da Solana no centro do QR Code */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                  <Image
                    src="/Solana_logo.png"
                    alt="Solana Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-xs text-gray-500 text-center break-all">
              {qrUrl}
            </p>
          </div>
        </div>
      )}

      {/* Wallets Suportadas */}
      <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('receive.supportedWallets')}</h3>
          <p className="text-sm text-gray-600">{t('receive.supportedWalletsDesc')}</p>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
              <Image
                src="/phantom.jpg"
                alt="Phantom"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-cover"
              />
            </div>
            <span className="text-xs text-gray-600 font-medium">Phantom</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
              <Image
                src="/solflare.png"
                alt="Solflare"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-cover"
              />
            </div>
            <span className="text-xs text-gray-600 font-medium">Solflare</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
              <Image
                src="/glow.png"
                alt="Glow"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-cover"
              />
            </div>
            <span className="text-xs text-gray-600 font-medium">Glow</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
              <Image
                src="/decaf.jpg"
                alt="Decaf Wallet"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-cover"
              />
            </div>
            <span className="text-xs text-gray-600 font-medium">Decaf</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
              <Image
                src="/espresso cash.png"
                alt="Espresso Cash"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-cover"
              />
            </div>
            <span className="text-xs text-gray-600 font-medium">Espresso</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
              <Image
                src="/ottr.png"
                alt="Ottr"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-cover"
              />
            </div>
            <span className="text-xs text-gray-600 font-medium">Ottr</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
              <Image
                src="/ultimate.jpg"
                alt="Ultimate"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-cover"
              />
            </div>
            <span className="text-xs text-gray-600 font-medium">Ultimate</span>
          </div>
        </div>
      </div>
    </div>
  );
} 