'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BalanceDisplay from '../components/BalanceDisplay';
import SolanaPayQRCode from '../components/SolanaPayQRCode';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
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

// Componente do Dashboard
function Dashboard() {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SolanaPix</h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* User Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sua Conta</h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Carteira Solana:</span>
              </p>
              <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                <p className="text-xs font-mono flex-1 break-all">
                  {user?.publicAddress}
                </p>
                <button
                  onClick={copyAddress}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {copied ? '✓ Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Saldo</h2>
       <div className="text-center py-8">
       <div className="text-4xl font-bold text-green-600 mb-2">
         <BalanceDisplay />
         </div>
       </div>
      </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Receive Payment */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Receber Pagamento</h3>
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500 mb-4">QR Code do Solana Pay</p>
              {/* Substituir botão pelo componente SolanaPayQRCode */}
              <SolanaPayQRCode />
            </div>
          </div>

          {/* Withdraw */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sacar via Pix</h3>
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500 mb-4">Converta USDC para Reais</p>
              <button 
                disabled
                className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
              >
                Em breve
              </button>
            </div>
          </div>
        </div>
      </main>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginForm />;
}
