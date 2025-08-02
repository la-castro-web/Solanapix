'use client';
import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // Mint de USDC na testnet
const BONK_MINT = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'; // Mint de BONK

async function fetchPrices() {
  const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin,bonk&vs_currencies=brl');
  const data = await res.json();
  return {
    solToBrl: data['solana'].brl,
    usdcToBrl: data['usd-coin'].brl,
    bonkToBrl: data['bonk'].brl,
  };
}

async function fetchUSDCBalance(pubkey: PublicKey) {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      mint: new PublicKey(USDC_MINT),
    });
    const amount = tokenAccounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
    return amount;
  } catch (err) {
    console.error('Erro ao buscar saldo USDC:', err);
    return 0;
  }
}

async function fetchBONKBalance(pubkey: PublicKey) {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      mint: new PublicKey(BONK_MINT),
    });
    const amount = tokenAccounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount || 0;
    return amount;
  } catch (err) {
    console.error('Erro ao buscar saldo BONK:', err);
    return 0;
  }
}

export default function BalanceDisplay() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [sol, setSol] = useState<number | null>(null);
  const [usdc, setUsdc] = useState<number | null>(null);
  const [bonk, setBonk] = useState<number | null>(null);
  const [prices, setPrices] = useState<{ solToBrl: number; usdcToBrl: number; bonkToBrl: number } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const fetchAll = async () => {
    if (!user) return;
    const pubkey = new PublicKey(user.publicAddress);
    try {
      const [solBalance, usdcBalance, bonkBalance, priceData] = await Promise.all([
        connection.getBalance(pubkey).then(lamports => lamports / 1_000_000_000),
        fetchUSDCBalance(pubkey),
        fetchBONKBalance(pubkey),
        fetchPrices(),
      ]);
      setSol(solBalance);
      setUsdc(usdcBalance);
      setBonk(bonkBalance);
      setPrices(priceData);
      setErro(null);
      hasLoaded.current = true;
    } catch (err) {
      console.error('Erro ao buscar saldo:', err);
      setSol(0);
      setUsdc(0);
      setBonk(0);
      setPrices({ solToBrl: 0, usdcToBrl: 0, bonkToBrl: 0 });
      if (!hasLoaded.current) setErro(t('home.balanceError'));
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user || !prices) return <p className="text-[#6B7280]">{t('home.loadingBalance')}</p>;
  if (erro) return <p className="text-[#FF5252]">{erro}</p>;

  const solInBrl = sol !== null ? sol * prices.solToBrl : 0;
  const usdcInBrl = usdc !== null ? usdc * prices.usdcToBrl : 0;
  const bonkInBrl = bonk !== null ? bonk * prices.bonkToBrl : 0;
  const totalBrl = solInBrl + usdcInBrl + bonkInBrl;

  return (
    <div className="space-y-4 w-full">
      {/* Saldo Total */}
      <Card className="bg-gradient-to-r from-[#00BFA6] to-[#9C27B0] border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-white text-sm font-medium mb-2">{t('common.totalBalance')}</h3>
            <p className="text-white text-4xl font-bold">R$ {totalBrl.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes dos Tokens */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="secondary" className="bg-[#00BFA6] text-white">USDC</Badge>
                  <span className="text-[#1F1F1F] font-semibold">{usdc?.toFixed(2)}</span>
                </div>
                <p className="text-[#6B7280] text-sm">≈ R$ {usdcInBrl.toFixed(2)}</p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                <Image 
                  src="/usdc.png" 
                  alt="USDC Logo" 
                  width={32} 
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="secondary" className="bg-[#9C27B0] text-white">SOL</Badge>
                  <span className="text-[#1F1F1F] font-semibold">{sol?.toFixed(4)}</span>
                </div>
                <p className="text-[#6B7280] text-sm">≈ R$ {solInBrl.toFixed(2)}</p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                <Image 
                  src="/Solana_logo.png" 
                  alt="Solana Logo" 
                  width={32} 
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="secondary" className="bg-[#FFD700] text-white">BONK</Badge>
                  <span className="text-[#1F1F1F] font-semibold">{bonk?.toFixed(2)}</span>
                </div>
                <p className="text-[#6B7280] text-sm">≈ R$ {bonkInBrl.toFixed(2)}</p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                <Image 
                  src="/bonk.png" 
                  alt="BONK Logo" 
                  width={32} 
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}