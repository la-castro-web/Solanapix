'use client';
import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useAuth } from '../contexts/AuthContext';
import { useRef } from 'react';

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // Mint de USDC na testnet

async function fetchPrices() {
  const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin&vs_currencies=brl');
  const data = await res.json();
  return {
    solToBrl: data['solana'].brl,
    usdcToBrl: data['usd-coin'].brl,
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

export default function BalanceDisplay() {
  const { user } = useAuth();
  const [sol, setSol] = useState<number | null>(null);
  const [usdc, setUsdc] = useState<number | null>(null);
  const [prices, setPrices] = useState<{ solToBrl: number; usdcToBrl: number } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasLoaded = useRef(false);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);
    const pubkey = new PublicKey(user.publicAddress);
    try {
      const [solBalance, usdcBalance, priceData] = await Promise.all([
        connection.getBalance(pubkey).then(lamports => lamports / 1_000_000_000),
        fetchUSDCBalance(pubkey),
        fetchPrices(),
      ]);
      setSol(solBalance);
      setUsdc(usdcBalance);
      setPrices(priceData);
      setErro(null);
      hasLoaded.current = true;
    } catch (err) {
      console.error('Erro ao buscar saldo:', err);
      setSol(0);
      setUsdc(0);
      setPrices({ solToBrl: 0, usdcToBrl: 0 });
      if (!hasLoaded.current) setErro('Erro ao buscar saldo. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user || !prices) return <p>Carregando saldo...</p>;
  if (erro) return <p style={{ color: 'red' }}>{erro}</p>;

  const solInBrl = sol !== null ? sol * prices.solToBrl : 0;
  const usdcInBrl = usdc !== null ? usdc * prices.usdcToBrl : 0;
  const totalBrl = solInBrl + usdcInBrl;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex w-full items-center justify-between mb-2">
        <div className="text-3xl font-bold text-green-600">
          Total: R$ {totalBrl.toFixed(2)}
        </div>
        <button
          onClick={fetchAll}
          className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded shadow text-xs font-semibold disabled:bg-gray-300"
          disabled={loading}
          title="Atualizar saldo"
        >
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-2">
        USDC: {usdc?.toFixed(2)} ({usdcInBrl.toFixed(2)} BRL)
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-2">
        SOL: {sol?.toFixed(4)} ({solInBrl.toFixed(2)} BRL)
      </div>
    </div>
  );
}