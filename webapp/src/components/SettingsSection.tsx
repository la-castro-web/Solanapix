'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, Copy, LogOut, Globe, Check } from 'lucide-react';

export default function SettingsSection() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (user?.publicAddress) {
      try {
        await navigator.clipboard.writeText(user.publicAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Erro ao copiar endereço:', err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  const toggleLanguage = (checked: boolean) => {
    setLanguage(checked ? 'en' : 'pt');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00BFA6] to-[#9C27B0] rounded-lg flex items-center justify-center">
              <Settings size={16} className="text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-[#1F1F1F]">{t('settings.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {t('settings.description')}
          </p>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#1F1F1F]">{t('settings.language')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            {t('settings.languageDesc')}
          </p>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe size={20} className="text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">
                  {language === 'pt' ? t('settings.portuguese') : t('settings.english')}
                </div>
                <div className="text-sm text-gray-500">
                  {language === 'pt' ? 'Português' : 'English'}
                </div>
              </div>
            </div>
            <Switch
              checked={language === 'en'}
              onCheckedChange={toggleLanguage}
              leftLabel="PT"
              rightLabel="EN"
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#1F1F1F]">{t('settings.account')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">{t('settings.walletAddress')}</label>
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-mono text-gray-700 break-all">
                  {user?.publicAddress || t('settings.notConnected')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAddress}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut size={16} />
            <span>{t('settings.disconnect')}</span>
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#1F1F1F]">{t('settings.about')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {t('settings.aboutText')}
            </p>
            <p className="text-xs text-gray-500">
              {t('settings.version')}: 1.0.0
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 