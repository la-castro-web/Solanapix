'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'received' | 'sent';
  amount: number;
  token: string;
  from: string;
  to: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  txHash: string;
  signature: string;
}

interface SolanaSignature {
  signature: string;
  slot: number;
  err: unknown;
  memo: string | null;
  blockTime: number;
}

interface SolanaAccountKey {
  pubkey: string;
  writable: boolean;
  signer: boolean;
}

interface SolanaTokenBalance {
  accountIndex: number;
  mint: string;
  owner: string;
  uiTokenAmount: {
    amount: string;
    decimals: number;
    uiAmount: number;
    uiAmountString: string;
  };
}

interface SolanaTransaction {
  signature: string;
  blockTime: number;
  meta: {
    err: unknown;
    fee: number;
    preBalances: number[];
    postBalances: number[];
    preTokenBalances: SolanaTokenBalance[];
    postTokenBalances: SolanaTokenBalance[];
    logMessages: string[];
  };
  transaction: {
    message: {
      accountKeys: SolanaAccountKey[];
      recentBlockhash: string;
      instructions: unknown[];
    };
  };
}

export default function TransactionHistory() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular totais reais
  const totalReceived = transactions
    .filter(tx => tx.type === 'received')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const transactionCount = transactions.length;

  // Expor totais para uso externo
  (TransactionHistory as { getStats?: () => { totalReceived: number; transactionCount: number } }).getStats = () => ({
    totalReceived,
    transactionCount
  });

  const fetchTransactions = useCallback(async () => {
    if (!user?.publicAddress) return;

    setLoading(true);
    setError(null);

    try {
      // Usar a mesma URL do Helius que já está configurada
      const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
      
      if (!rpcUrl) {
        throw new Error('RPC URL não configurada');
      }

      // Buscar assinaturas de transações
      const signaturesResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [
            user.publicAddress,
            {
              limit: 20,
            },
          ],
        }),
      });

      if (!signaturesResponse.ok) {
        throw new Error('Erro ao buscar assinaturas');
      }

      const signaturesData = await signaturesResponse.json();
      const signatures: SolanaSignature[] = signaturesData.result || [];

      // Buscar detalhes das transações
      const transactionPromises = signatures.map(async (sig, index) => {
        setProgress(((index + 1) / signatures.length) * 100);
        
        const txResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTransaction',
            params: [
              sig.signature,
              {
                encoding: 'jsonParsed',
                maxSupportedTransactionVersion: 0,
              },
            ],
          }),
        });

        if (!txResponse.ok) {
          return null;
        }

        const txData = await txResponse.json();
        return txData.result as SolanaTransaction;
      });

      const transactionResults = await Promise.all(transactionPromises);
      const validTransactions = transactionResults.filter(tx => tx !== null) as SolanaTransaction[];

      // Processar transações
      const processedTransactions: Transaction[] = validTransactions
        .map(tx => {
          if (!tx || tx.meta?.err) return null;

          const isIncoming = tx.transaction.message.accountKeys.some(
            key => key.pubkey === user.publicAddress && !key.signer
          );

          const isOutgoing = tx.transaction.message.accountKeys.some(
            key => key.pubkey === user.publicAddress && key.signer
          );

          if (!isIncoming && !isOutgoing) return null;

          // Determinar tipo de transação
          let type: 'received' | 'sent';
          let amount = 0;
          let token = 'SOL';

          if (isIncoming && !isOutgoing) {
            type = 'received';
            // Calcular valor recebido (diferença entre saldos)
            const preBalance = tx.meta.preBalances[0] || 0;
            const postBalance = tx.meta.postBalances[0] || 0;
            amount = (postBalance - preBalance) / 1e9; // Converter lamports para SOL
          } else if (isOutgoing && !isIncoming) {
            type = 'sent';
            // Calcular valor enviado
            const preBalance = tx.meta.preBalances[0] || 0;
            const postBalance = tx.meta.postBalances[0] || 0;
            amount = (preBalance - postBalance) / 1e9; // Converter lamports para SOL
          } else {
            // Transação complexa, pular
            return null;
          }

          // Verificar se é transação de token SPL
          if (tx.meta.preTokenBalances.length > 0 || tx.meta.postTokenBalances.length > 0) {
            // Processar tokens SPL
            const preTokenBalances = tx.meta.preTokenBalances;
            const postTokenBalances = tx.meta.postTokenBalances;
            
            // Encontrar mudanças nos tokens
            for (const postBalance of postTokenBalances) {
              const preBalance = preTokenBalances.find(
                pre => pre.mint === postBalance.mint && pre.owner === user.publicAddress
              );
              
              if (preBalance) {
                const change = postBalance.uiTokenAmount.uiAmount - preBalance.uiTokenAmount.uiAmount;
                if (change > 0) {
                  type = 'received';
                  amount = change;
                  token = getTokenSymbol(postBalance.mint);
                } else if (change < 0) {
                  type = 'sent';
                  amount = Math.abs(change);
                  token = getTokenSymbol(postBalance.mint);
                }
              }
            }
          }

          return {
            id: tx.signature,
            type,
            amount,
            token,
            from: type === 'received' ? 'Unknown' : user.publicAddress,
            to: type === 'sent' ? 'Unknown' : user.publicAddress,
            timestamp: new Date(tx.blockTime * 1000),
            status: 'completed',
            txHash: tx.signature,
            signature: tx.signature,
          };
        })
        .filter(tx => tx !== null) as Transaction[];

      setTransactions(processedTransactions);
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      setError('Erro ao carregar transações');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, [user?.publicAddress]);

  // Função para obter símbolo do token baseado no mint
  const getTokenSymbol = (mint: string): string => {
    const tokenMints: Record<string, string> = {
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'BONK',
      'So11111111111111111111111111111111111111112': 'SOL',
    };
    return tokenMints[mint] || 'Unknown';
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Agora';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">{t('common.completed')}</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{t('common.pending')}</Badge>;
      case 'failed':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">{t('common.failed')}</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">{t('common.unknown')}</Badge>;
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00BFA6] to-[#9C27B0] rounded-lg flex items-center justify-center">
              <RefreshCw size={16} className="text-white animate-spin" />
            </div>
            <CardTitle className="text-lg font-semibold text-[#1F1F1F]">{t('home.transactionHistory')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00BFA6] to-[#9C27B0] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <p className="text-[#6B7280]">{t('common.loading')}</p>
            {progress > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#00BFA6] to-[#9C27B0] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00BFA6] to-[#9C27B0] rounded-lg flex items-center justify-center">
              <RefreshCw size={16} className="text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-[#1F1F1F]">{t('home.transactionHistory')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchTransactions} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00BFA6] to-[#9C27B0] rounded-lg flex items-center justify-center">
              <RefreshCw size={16} className="text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-[#1F1F1F]">{t('home.transactionHistory')}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTransactions}
            disabled={loading}
            className="text-[#6B7280] hover:text-[#1F1F1F] hover:bg-[#00BFA6]/10"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#6B7280]">Nenhuma transação encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'received' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'received' ? (
                      <ArrowDownLeft size={20} />
                    ) : (
                      <ArrowUpRight size={20} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-[#1F1F1F]">
                        {transaction.type === 'received' ? '+' : '-'}{transaction.amount.toFixed(4)} {transaction.token}
                      </span>
                      {getStatusIcon(transaction.status)}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-[#6B7280]">
                        {transaction.type === 'received' ? 'Recebido' : 'Enviado'}
                      </span>
                      <span className="text-xs text-[#6B7280]">•</span>
                      <span className="text-xs text-[#6B7280]">{formatDate(transaction.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            ))}
            
            {transactions.length > 5 && (
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="w-full"
              >
                {showAll ? 'Mostrar Menos' : `Ver Todas (${transactions.length})`}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 