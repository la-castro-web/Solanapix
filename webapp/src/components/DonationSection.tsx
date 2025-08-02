'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Instagram, AlertCircle, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);

interface Project {
  id: string;
  name: string;
  description: string;
  image: string;
  instagram: string;
  wallet: string;
  category: string;
}

const PROJECTS: Project[] = [
  {
    id: 'resgatandovidas4patas',
    name: 'Resgatando Vidas 4 Patas',
    description: 'Projeto que acolhe gatinhos em situação de rua, cuida deles e os coloca para adoção. Ajude-nos a dar uma nova chance para esses animais que precisam de amor e cuidado.',
    image: '/resgatandovidas.jpg',
    instagram: 'https://www.instagram.com/resgatandovidas4patas/',
    wallet: 'DLo6tLDoEyyrZeDwNCQtobyqnJ1RTPbc19jeWXqeCcDQ',
    category: 'Animais'
  }
];

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

interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  mint: string;
  logo: string;
  color: string;
  balance: number;
}

const TOKEN_CONFIGS: TokenConfig[] = [
  {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    mint: 'So11111111111111111111111111111111111111112',
    logo: '/Solana_logo.png',
    color: 'from-purple-600 to-cyan-600',
    balance: 0
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    logo: '/usdc.png',
    color: 'bg-blue-600',
    balance: 0
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    logo: '/bonk.png',
    color: 'from-orange-600 to-yellow-600',
    balance: 0
  }
];

export default function DonationSection() {
  const { user, magic } = useAuth();
  const { t } = useLanguage();
  const [selectedToken, setSelectedToken] = useState<string>('SOL');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [prices, setPrices] = useState<{ solToBrl: number; usdcToBrl: number; bonkToBrl: number } | null>(null);
  const [tokenBalances, setTokenBalances] = useState<TokenConfig[]>(TOKEN_CONFIGS);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

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

  const handleDonate = async () => {
    if (!user?.publicAddress || !selectedTokenData || !magic) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error(t('donations.invalidAmount'));
      }

      if (amountValue > selectedTokenData.balance) {
        throw new Error(t('donations.insufficientBalance'));
      }

      // Verificar se o usuário está logado
      const isLoggedIn = await magic.user.isLoggedIn();
      if (!isLoggedIn) {
        throw new Error(t('donations.userNotLoggedIn'));
      }

      const recipientPubkey = new PublicKey(PROJECTS[0].wallet);
      const senderPubkey = new PublicKey(user.publicAddress);

      // Criar transação
      const transaction = new Transaction();

      if (selectedToken === 'SOL') {
        // Transferência de SOL
        const transferInstruction = SystemProgram.transfer({
          fromPubkey: senderPubkey,
          toPubkey: recipientPubkey,
          lamports: amountValue * LAMPORTS_PER_SOL,
        });
        transaction.add(transferInstruction);
      } else {
        // Transferência de token SPL
        const senderTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(selectedTokenData.mint),
          senderPubkey
        );

        const recipientTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(selectedTokenData.mint),
          recipientPubkey
        );

        const transferInstruction = createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          senderPubkey,
          amountValue * Math.pow(10, selectedTokenData.decimals)
        );
        transaction.add(transferInstruction);
      }

      // Obter o último blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPubkey;

      // Usar Magic para assinar a transação
      const signedTx = await magic.solana.signTransaction(transaction, {
        requireAllSignatures: false,
        verifySignatures: true
      });
      
      // Enviar a transação assinada
      const signature = await connection.sendRawTransaction(signedTx.rawTransaction);
      
      // Aguardar confirmação
      await connection.confirmTransaction(signature, 'confirmed');
      
      setSuccess(t('donations.donationSuccess')
        .replace('{amount}', amount)
        .replace('{token}', selectedToken)
        .replace('{project}', PROJECTS[0].name)
        .replace('{hash}', signature.slice(0, 8))
      );
      setAmount('');
      
      // Atualizar saldos
      await fetchBalances();
    } catch (err) {
      console.error('Erro na doação:', err);
      setError(err instanceof Error ? err.message : t('donations.donationError'));
    } finally {
      setLoading(false);
    }
  };

  const openInstagram = () => {
    window.open(PROJECTS[0].instagram, '_blank');
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
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
              <Heart size={16} className="text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-[#1F1F1F]">{t('donations.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {t('donations.description')}
          </p>
        </CardContent>
      </Card>

      {/* Projetos */}
      {PROJECTS.map((project) => (
        <Card 
          key={project.id} 
          className={`border border-gray-200 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md ${
            expandedProject === project.id ? 'ring-2 ring-purple-200' : ''
          }`}
          onClick={() => toggleProjectExpansion(project.id)}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Image
                  src={project.image}
                  alt={project.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{t('common.projectName')}</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInstagram();
                      }}
                      className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                    >
                      <Instagram size={16} />
                      <span className="hidden sm:inline">{t('common.instagram')}</span>
                    </Button>
                    <div className="flex items-center space-x-1 text-gray-400">
                      {expandedProject === project.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{t('common.projectDescription')}</p>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {t('donations.projectCategory')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {t('donations.wallet')} {project.wallet.slice(0, 6)}...{project.wallet.slice(-4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Seção expansível de doação */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedProject === project.id 
                  ? 'max-h-[1000px] opacity-100 mt-6 pt-6 border-t border-gray-200' 
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="space-y-6">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedToken(token.symbol);
                        }}
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

                {/* Formulário de Doação */}
                <div>
                  <h4 className="text-base font-semibold text-[#1F1F1F] mb-3">{t('donations.makeDonation')}</h4>
                  <div className="space-y-4">
                    {/* Valor */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">{t('donations.tokenValue')} {selectedToken}</div>
                      <div className="relative">
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => {
                            e.stopPropagation();
                            setAmount(e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="pr-20"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMaxAmount();
                          }}
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
                        <span className="text-sm font-medium text-gray-700">{t('donations.donationValue')}</span>
                        <span className="text-lg font-bold text-green-600">
                          R$ {amount ? calculateBrlValue(amount, selectedToken).toFixed(2) : '0.00'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {t('donations.conversionRate')} 1 {selectedToken} = R$ {
                          prices ? 
                            (selectedToken === 'SOL' ? prices.solToBrl :
                             selectedToken === 'USDC' ? prices.usdcToBrl :
                             selectedToken === 'BONK' ? prices.bonkToBrl : 0).toFixed(4)
                          : '0.00'
                        }
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

                    {/* Botão de Doação */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDonate();
                      }}
                      disabled={loading || !amount}
                      className={`w-full py-3 px-4 rounded-xl transition-all disabled:bg-gray-300 disabled:cursor-not-allowed ${
                        selectedTokenData ? `bg-gradient-to-r ${selectedTokenData.color}` : 'bg-gray-600'
                      } hover:opacity-90 text-white font-semibold`}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 size={16} className="animate-spin" />
                          <span>{t('donations.processing')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Heart size={16} />
                          <span>{t('donations.donate')} {amount || '0'} {selectedToken}</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Informações Adicionais */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="pt-3 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('donations.howItWorks')}</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• {t('donations.howItWorks1')}</li>
                <li>• {t('donations.howItWorks2')}</li>
                <li>• {t('donations.howItWorks3')}</li>
                <li>• {t('donations.howItWorks4')}</li>
                <li>• {t('donations.howItWorks5')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 