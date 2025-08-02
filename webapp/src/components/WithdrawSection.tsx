'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);

// Função para buscar cotações em tempo real
async function fetchPrices() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin,bonk&vs_currencies=brl');
    const data = await res.json();
    return {
      solToBrl: data['solana'].brl,
      usdcToBrl: data['usd-coin'].brl,
      bonkToBrl: data['bonk'].brl,
    };
  } catch (error) {
    console.error('Erro ao buscar cotações:', error);
    return {
      solToBrl: 5.5,
      usdcToBrl: 5.5,
      bonkToBrl: 0.0001,
    };
  }
}

interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  mint: string;
  logo: string;
  color: string;
}

const TOKEN_CONFIGS: TokenBalance[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    balance: 0,
    decimals: 9,
    mint: 'So11111111111111111111111111111111111111112',
    logo: '/Solana_logo.png',
    color: 'from-purple-600 to-cyan-600',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 0,
    decimals: 6,
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    logo: '/usdc.png',
    color: 'bg-blue-600',
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    balance: 0,
    decimals: 5,
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    logo: '/bonk.png',
    color: 'from-orange-600 to-yellow-600',
  }
];

export default function WithdrawSection() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedToken, setSelectedToken] = useState<string>('SOL');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [prices, setPrices] = useState<{ solToBrl: number; usdcToBrl: number; bonkToBrl: number } | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>(TOKEN_CONFIGS);

  // Buscar cotações
  const fetchPricesData = useCallback(async () => {
    try {
      const priceData = await fetchPrices();
      setPrices(priceData);
    } catch (err) {
      console.error('Erro ao buscar cotações:', err);
    }
  }, []);

  // Buscar saldos dos tokens
  const fetchBalances = useCallback(async () => {
    if (!user?.publicAddress) return;

    try {
      const pubkey = new PublicKey(user.publicAddress);
      
      // Buscar saldo SOL
      const solBalance = await connection.getBalance(pubkey);
      
      // Buscar saldos de tokens SPL
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
        programId: TOKEN_PROGRAM_ID,
      });

      const updatedBalances = TOKEN_CONFIGS.map(token => {
        if (token.symbol === 'SOL') {
          return { ...token, balance: solBalance / LAMPORTS_PER_SOL };
        }
        
        const account = tokenAccounts.value.find(acc => 
          acc.account.data.parsed.info.mint === token.mint
        );
        
        return {
          ...token,
          balance: account ? account.account.data.parsed.info.tokenAmount.uiAmount : 0
        };
      });

      setTokenBalances(updatedBalances);
    } catch (err) {
      console.error('Erro ao buscar saldos:', err);
    }
  }, [user?.publicAddress]);

  // Calcular valor em reais
  const calculateBrlValue = (tokenAmount: string, tokenSymbol: string) => {
    if (!prices || !tokenAmount || isNaN(parseFloat(tokenAmount))) return 0;
    
    const amount = parseFloat(tokenAmount);
    switch (tokenSymbol) {
      case 'SOL':
        return amount * prices.solToBrl;
      case 'USDC':
        return amount * prices.usdcToBrl;
      case 'BONK':
        return amount * prices.bonkToBrl;
      default:
        return 0;
    }
  };

  useEffect(() => {
    fetchPricesData();
    fetchBalances();
  }, [fetchPricesData, fetchBalances]);

  const selectedTokenData = tokenBalances.find(t => t.symbol === selectedToken);

  const handleWithdraw = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simular processamento de saque
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(`Saque de ${amount} ${selectedToken} solicitado com sucesso! Você receberá R$ ${calculateBrlValue(amount, selectedToken).toFixed(2)} em sua conta bancária em 1-3 dias úteis.`);
      setAmount('');
    } catch (err) {
      console.error('Erro no saque:', err);
      setError('Erro ao processar saque. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    if (selectedTokenData) {
      setAmount(selectedTokenData.balance.toString());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00BFA6] to-[#9C27B0] rounded-lg flex items-center justify-center">
              <ArrowUpRight size={16} className="text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-[#1F1F1F]">{t('withdraw.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {t('withdraw.description')}
          </p>
        </CardContent>
      </Card>

      {/* Detalhes do Saque */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#1F1F1F]">{t('withdraw.withdrawDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Token */}
          <div>
            <h4 className="text-base font-semibold text-[#1F1F1F] mb-3">{t('donations.selectToken')}</h4>
            <div className="grid grid-cols-3 gap-3">
              {tokenBalances.map((token) => (
                <Button
                  key={token.symbol}
                  variant={selectedToken === token.symbol ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200 ${
                    selectedToken === token.symbol 
                      ? `bg-gradient-to-r ${token.color} text-white border-0 scale-105` 
                      : 'hover:bg-gray-50 hover:scale-102'
                  }`}
                  onClick={() => setSelectedToken(token.symbol)}
                >
                  <Image
                    src={token.logo}
                    alt={token.name}
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                  <div className="text-center">
                    <div className="font-semibold text-sm">{token.symbol}</div>
                    <div className="text-xs opacity-80">{token.balance.toFixed(4)}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">{t('withdraw.tokenValue')} {selectedToken}</div>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-20"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleMaxAmount}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-2 text-xs"
              >
                {t('common.max')}
              </Button>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t('donations.availableBalance')} {selectedTokenData?.balance.toFixed(6)} {selectedToken}</span>
            </div>
          </div>

          {/* Valor em Reais */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{t('withdraw.valueToReceive')}</span>
              <span className="text-lg font-bold text-green-600">
                R$ {amount ? calculateBrlValue(amount, selectedToken).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t('withdraw.fee')} • {t('withdraw.conversionRate')} 1 {selectedToken} = R$ {
                prices ? 
                  (selectedToken === 'SOL' ? prices.solToBrl :
                   selectedToken === 'USDC' ? prices.usdcToBrl :
                   selectedToken === 'BONK' ? prices.bonkToBrl : 0).toFixed(4)
                : '0.00'
              }
            </div>
          </div>

          {/* Dados Bancários */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-[#1F1F1F]">{t('withdraw.bankDetails')}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{t('withdraw.bankName')}</label>
                <Input placeholder="Banco do Brasil" className="mt-1" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">{t('withdraw.accountType')}</label>
                <Input placeholder="Conta Corrente" className="mt-1" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">{t('withdraw.accountNumber')}</label>
                <Input placeholder="12345-6" className="mt-1" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">{t('withdraw.agency')}</label>
                <Input placeholder="0001" className="mt-1" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">{t('withdraw.cpf')}</label>
                <Input placeholder="123.456.789-00" className="mt-1" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">{t('withdraw.accountHolder')}</label>
                <Input placeholder="João Silva" className="mt-1" />
              </div>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          {/* Sucesso */}
          {success && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-green-600 text-sm">{success}</span>
            </div>
          )}

          {/* Botão de Saque */}
          <Button
            onClick={handleWithdraw}
            disabled={loading || !amount}
            className={`w-full py-3 px-4 rounded-xl transition-all disabled:bg-gray-300 disabled:cursor-not-allowed ${
              selectedTokenData ? `bg-gradient-to-r ${selectedTokenData.color}` : 'bg-gray-600'
            } hover:opacity-90 text-white font-semibold`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 size={16} className="animate-spin" />
                <span>{t('withdraw.processing')}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <ArrowUpRight size={16} />
                <span>{t('withdraw.requestWithdraw')} {amount || '0'} {selectedToken}</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Informações do Offramp */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">{t('withdraw.offrampInfo')}</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• {t('withdraw.offrampInfo1')}</li>
              <li>• {t('withdraw.offrampInfo2')}</li>
              <li>• {t('withdraw.offrampInfo3')}</li>
              <li>• {t('withdraw.offrampInfo4')}</li>
              <li>• {t('withdraw.offrampInfo5')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 