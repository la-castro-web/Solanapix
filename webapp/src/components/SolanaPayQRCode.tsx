'use client';
import React, { useState } from 'react';
import { encodeURL } from '@solana/pay';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'react-qr-code';

// Função para buscar cotação BRL→USDC (simples, pode ser trocada por API real)
async function fetchBRLtoUSDC(brl: number): Promise<number> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd-coin%2Cbrl&vs_currencies=brl');
    const data = await res.json();
    const usdcToBrl = data['usd-coin'].brl;
    return brl / usdcToBrl;
  } catch {
    throw new Error('Erro ao buscar cotação BRL→USDC');
  }
}

export default function SolanaPayQRCode() {
  const { user } = useAuth();
  const [brl, setBrl] = useState('');
  const [usdc, setUsdc] = useState<number | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Gerar QR Code clicado', { brl, user });
    setError('');
    if (!user?.publicAddress) {
      setError('Usuário não autenticado');
      return;
    }
    const brlValue = parseFloat(brl.replace(',', '.'));
    if (isNaN(brlValue) || brlValue <= 0) {
      setError('Digite um valor em BRL válido');
      return;
    }
    setLoading(true);
    try {
        const usdcValue = await fetchBRLtoUSDC(brlValue);
        setUsdc(usdcValue);
        const url = encodeURL({
            recipient: new PublicKey(user.publicAddress),
            amount: new BigNumber(usdcValue).decimalPlaces(6),
            splToken: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
            label: 'SolanaPix',
            message: `Pagamento de R$${brlValue.toFixed(2)} via SolanaPix`,
            memo: 'PixUSDC',
        });
        setQrUrl(url.toString());
      setQrUrl(url.toString());
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message || 'Erro ao gerar QR Code');
      } else {
        setError('Erro ao gerar QR Code');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <form onSubmit={handleGenerate} className="w-full max-w-xs flex flex-col items-center gap-2">
        <label className="font-medium">Valor (BRL):</label>
        <input
          className="border border-gray-300 rounded-lg px-4 py-2 text-center w-full"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Digite o valor em reais"
          value={brl}
          onChange={e => setBrl(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg w-full mt-2 disabled:bg-gray-300"
          disabled={loading}
        >
          {loading ? 'Gerando QR Code...' : 'Gerar QR Code'}
        </button>
        {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      </form>
      {qrUrl && (
        <div className="mt-6 flex flex-col items-center bg-white p-4 rounded-xl shadow">
          <div className="mb-2 text-gray-700 text-sm">USDC: {usdc?.toFixed(2)}</div>
          <QRCode value={qrUrl} size={220} />
          <div className="mt-2 text-xs text-gray-400 break-all text-center">{qrUrl}</div>
        </div>
      )}
    </div>
  );
} 