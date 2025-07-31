'use client';

import { useState } from 'react';
import { Copy, Check, User, Wallet, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function SettingsSection() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (user?.publicAddress && user.publicAddress !== 'N/A') {
      try {
        await navigator.clipboard.writeText(user.publicAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Erro ao copiar:', err);
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = user.publicAddress;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Informações da Conta */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Informações da Conta</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user?.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Carteira Solana</label>
            <div className="flex items-center space-x-2">
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg flex-1 font-mono text-sm break-all">
                {user?.publicAddress}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={copyAddress}
                className="shrink-0"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Segurança */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Segurança</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Autenticação Magic Link</p>
                <p className="text-xs text-gray-600">Login seguro sem senhas</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Carteira Solana</p>
                <p className="text-xs text-gray-600">Transações seguras na blockchain</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sobre o App */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Wallet size={16} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Sobre o SolanaPix</h2>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            SolanaPix permite que pequenos comércios aceitem pagamentos em USDC via Solana Pay, 
            com a facilidade do Pix para saques.
          </p>
          <p>
            <strong>Versão:</strong> 1.0.0
          </p>
          <p>
            <strong>Rede:</strong> Solana Mainnet
          </p>
        </div>
      </div>
    </div>
  );
} 