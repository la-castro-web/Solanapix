'use client';

import { RefreshCw, TrendingUp } from 'lucide-react';
import BalanceDisplay from './BalanceDisplay';
import { Button } from '@/components/ui/button';

export default function BalanceCard() {
  return (
    <div className="bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl p-6 mb-6 border border-cyan-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Seu Saldo</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={16} />
        </Button>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          <BalanceDisplay />
        </div>
        <p className="text-sm text-gray-600">
          Saldo atualizado em tempo real
        </p>
      </div>
    </div>
  );
} 