'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import BalanceCard from '../components/BalanceCard';
import SolanaPayQRCode from '../components/SolanaPayQRCode';
import DonationSection from '../components/DonationSection';
import SettingsSection from '../components/SettingsSection';

// Componente de Login
function LoginForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      await login(email);
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">SP</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SolanaPix</h1>
          <p className="text-gray-600">Pagamentos em USDC via Solana Pay</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
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
            {isLoading ? 'Enviando link mágico...' : 'Entrar com Magic Link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Um link será enviado para seu email</p>
          <p>Clique no link para fazer login</p>
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
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">💡</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Dica Rápida</h2>
              </div>
              <p className="text-sm text-gray-600">
                Use a aba "Receber" para gerar QR codes e aceitar pagamentos em USDC via Solana Pay.
              </p>
            </div>
          </div>
        );
      
      case 'receive':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📱</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Receber Pagamento</h2>
              </div>
              <SolanaPayQRCode />
            </div>
          </div>
        );
      
      case 'donate':
        return <DonationSection />;
      
      case 'settings':
        return <SettingsSection />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header 
        title={
          activeTab === 'home' ? 'Início' :
          activeTab === 'receive' ? 'Receber' :
          activeTab === 'donate' ? 'Doar' :
          'Configurações'
        }
      />
      
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginForm />;
}
