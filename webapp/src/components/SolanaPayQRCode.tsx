'use client';
import React, { useState } from 'react';
import { encodeURL } from '@solana/pay';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'react-qr-code';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [copied, setCopied] = useState(false);

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

  const copyUrl = async () => {
    if (qrUrl) {
      try {
        await navigator.clipboard.writeText(qrUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Erro ao copiar:', err);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Valor em Reais (BRL)
          </label>
          <div className="relative">
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0,00"
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

        <Button
          type="submit"
          disabled={loading || !brl}
          className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Gerando QR Code...' : 'Gerar QR Code'}
        </Button>
      </form>

      {qrUrl && (
        <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <QrCode size={20} className="text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">QR Code Solana Pay</h3>
            </div>
            <p className="text-sm text-gray-600">
              Valor: <span className="font-medium text-green-600">R$ {brl}</span> 
              {' '}({usdc?.toFixed(2)} USDC)
            </p>
          </div>
          
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <QRCode value={qrUrl} size={200} />
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={copyUrl}
              variant="outline"
              className="w-full"
            >
              {copied ? (
                <>
                  <Check size={16} className="mr-2" />
                  URL Copiada!
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  Copiar URL
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center break-all">
              {qrUrl}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 