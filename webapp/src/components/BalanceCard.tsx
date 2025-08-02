'use client';

import { RefreshCw, TrendingUp } from 'lucide-react';
import BalanceDisplay from './BalanceDisplay';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BalanceCard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { t } = useLanguage();

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="bg-gradient-to-br from-[#00BFA6]/10 to-[#9C27B0]/10 rounded-2xl p-6 mb-6 border border-[#00BFA6]/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00BFA6] to-[#9C27B0] rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-[#1F1F1F]">{t('home.yourBalance')}</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#6B7280] hover:text-[#1F1F1F] hover:bg-[#00BFA6]/10"
          onClick={handleRefresh}
        >
          <RefreshCw size={16} />
        </Button>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-[#1F1F1F] mb-2">
          <BalanceDisplay key={refreshKey} />
        </div>
      </div>
    </div>
  );
} 