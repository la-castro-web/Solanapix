'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

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

// Configuração dos tokens com preços aproximados em BRL
const TOKEN_CONFIGS = {
  'So11111111111111111111111111111111111111112': { symbol: 'SOL', decimals: 9, priceBrl: 5.5 },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', decimals: 6, priceBrl: 5.5 },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK', decimals: 5, priceBrl: 0.0001 },
};

export default function TransactionStats() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalSent: 0,
    transactionCount: 0,
    averageTransaction: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchTransactionStats = useCallback(async () => {
    if (!user?.publicAddress) return;

    setLoading(true);

    try {
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
              limit: 50,
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
      const transactionPromises = signatures.map(async (sig) => {
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

      // Processar transações para estatísticas
      let totalReceived = 0;
      let totalSent = 0;
      let transactionCount = 0;

      validTransactions.forEach(tx => {
        if (!tx || tx.meta?.err) return;

        const userAccountIndex = tx.transaction.message.accountKeys.findIndex(
          key => key.pubkey === user.publicAddress
        );

        if (userAccountIndex === -1) return;

        let hasRelevantTransaction = false;
        let transactionReceived = 0;
        let transactionSent = 0;

        // Processar SOL nativo
        const preBalance = tx.meta.preBalances[userAccountIndex] || 0;
        const postBalance = tx.meta.postBalances[userAccountIndex] || 0;
        
        if (preBalance !== postBalance) {
          const solChange = (postBalance - preBalance) / 1e9; // Converter lamports para SOL
          
          if (Math.abs(solChange) > 0.000001) { // Ignorar mudanças muito pequenas
            const solValueBrl = solChange * TOKEN_CONFIGS['So11111111111111111111111111111111111111112'].priceBrl;
            
            if (solChange > 0) {
              transactionReceived += solValueBrl;
            } else {
              transactionSent += Math.abs(solValueBrl);
            }
            hasRelevantTransaction = true;
          }
        }

        // Processar tokens SPL
        const preTokenBalances = tx.meta.preTokenBalances || [];
        const postTokenBalances = tx.meta.postTokenBalances || [];

        // Encontrar balanços do usuário
        const userPreTokens = preTokenBalances.filter(balance => 
          balance.owner === user.publicAddress
        );
        const userPostTokens = postTokenBalances.filter(balance => 
          balance.owner === user.publicAddress
        );

        // Comparar balanços de tokens
        userPreTokens.forEach(preToken => {
          const postToken = userPostTokens.find(pt => pt.mint === preToken.mint);
          const preAmount = preToken.uiTokenAmount.uiAmount || 0;
          const postAmount = postToken?.uiTokenAmount.uiAmount || 0;
          const change = postAmount - preAmount;

          if (Math.abs(change) > 0.000001) { // Ignorar mudanças muito pequenas
            const tokenConfig = TOKEN_CONFIGS[preToken.mint as keyof typeof TOKEN_CONFIGS];
            if (tokenConfig) {
              const tokenValueBrl = change * tokenConfig.priceBrl;
              
              if (change > 0) {
                transactionReceived += tokenValueBrl;
              } else {
                transactionSent += Math.abs(tokenValueBrl);
              }
              hasRelevantTransaction = true;
            }
          }
        });

        // Verificar tokens novos (que não existiam antes)
        userPostTokens.forEach(postToken => {
          const preToken = userPreTokens.find(pt => pt.mint === postToken.mint);
          if (!preToken && postToken.uiTokenAmount.uiAmount > 0) {
            const amount = postToken.uiTokenAmount.uiAmount;
            const tokenConfig = TOKEN_CONFIGS[postToken.mint as keyof typeof TOKEN_CONFIGS];
            if (tokenConfig) {
              const tokenValueBrl = amount * tokenConfig.priceBrl;
              transactionReceived += tokenValueBrl;
              hasRelevantTransaction = true;
            }
          }
        });

        if (hasRelevantTransaction) {
          totalReceived += transactionReceived;
          totalSent += transactionSent;
          transactionCount++;
        }
      });

      const averageTransaction = transactionCount > 0 ? (totalReceived + totalSent) / transactionCount : 0;

      setStats({
        totalReceived,
        totalSent,
        transactionCount,
        averageTransaction
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setStats({
        totalReceived: 0,
        totalSent: 0,
        transactionCount: 0,
        averageTransaction: 0
      });
    } finally {
      setLoading(false);
    }
  }, [user?.publicAddress]);

  useEffect(() => {
    fetchTransactionStats();
  }, [fetchTransactionStats]);

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00BFA6] to-[#9C27B0] rounded-lg flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <CardTitle className="text-lg font-semibold text-[#1F1F1F]">
            {loading ? t('common.loading') : t('home.quickStats')}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Total Recebido */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">{t('home.totalReceived')}</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {loading ? '...' : `R$ ${stats.totalReceived.toFixed(2)}`}
            </p>
          </div>

          {/* Total de Transações */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Activity size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{t('home.transactions')}</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {loading ? '...' : stats.transactionCount}
            </p>
          </div>

          {/* Total Enviado */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown size={16} className="text-red-600" />
              <span className="text-sm font-medium text-red-800">{t('home.totalSent')}</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {loading ? '...' : `R$ ${stats.totalSent.toFixed(2)}`}
            </p>
          </div>

          {/* Média por Transação */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign size={16} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-800">{t('home.averageTx')}</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {loading ? '...' : `R$ ${stats.averageTransaction.toFixed(2)}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 