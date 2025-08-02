'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import BottomNavigation from '../components/BottomNavigation';
import BalanceCard from '../components/BalanceCard';
import SolanaPayQRCode from '../components/SolanaPayQRCode';
import DonationSection from '../components/DonationSection';
import WithdrawSection from '../components/WithdrawSection';
import SettingsSection from '../components/SettingsSection';
import TransactionHistory from '../components/TransactionHistory';
import TransactionStats from '../components/TransactionStats';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';

// Componente de Login
function LoginForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      await login(email);
    } catch (err) {
      setError(t('common.loginError'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <Image
              src="/splash-icon.png"
              alt="SolanaPix Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('common.solanaPix')}</h1>
          <p className="text-gray-600">{t('common.solanaPayDescription')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('common.email')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('common.emailPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-xl transition-all"
          >
            {isLoading ? t('common.sendingMagicLink') : t('common.loginWithMagicLink')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>{t('common.magicLinkInstructions')}</p>
        </div>
      </div>
    </div>
  );
}

// Componente do Dashboard Mobile
function Dashboard() {
  const [activeTab, setActiveTab] = useState('home');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            <BalanceCard />
            
            {/* Estatísticas Rápidas */}
            <TransactionStats />

            {/* Histórico de Transações */}
            <TransactionHistory />

            {/* Dica Rápida */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#00BFA6] to-[#9C27B0] rounded-lg flex items-center justify-center">
                    <Zap size={16} className="text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1F1F1F]">Dica Rápida</h3>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Use a aba &quot;Receber&quot; para gerar QR codes e aceitar pagamentos em USDC via Solana Pay.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'receive':
        return <SolanaPayQRCode />;
      
      case 'withdraw':
        return <WithdrawSection />;
      
      case 'donate':
        return <DonationSection />;
      
      case 'settings':
        return <SettingsSection />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <main className="px-4 py-6">
        {renderTabContent()}
      </main>
      
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

// Componente principal
export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00BFA6] to-[#9C27B0] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-[#6B7280]">Carregando...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginForm />;
}
