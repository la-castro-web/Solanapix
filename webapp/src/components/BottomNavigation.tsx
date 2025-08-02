'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Wallet, QrCode, Heart, Settings, ArrowUpRight } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  activeColor: string;
  bgColor: string;
  activeBgColor: string;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { t } = useLanguage();

  const tabs: Tab[] = [
    {
      id: 'home',
      label: t('nav.home'),
      icon: Wallet,
      color: 'text-[#6B7280]',
      activeColor: 'text-[#00BFA6]',
      bgColor: 'bg-transparent',
      activeBgColor: 'bg-[#00BFA6]/10',
    },
    {
      id: 'receive',
      label: t('nav.receive'),
      icon: QrCode,
      color: 'text-[#6B7280]',
      activeColor: 'text-[#00BFA6]',
      bgColor: 'bg-transparent',
      activeBgColor: 'bg-[#00BFA6]/10',
    },
    {
      id: 'withdraw',
      label: t('nav.withdraw'),
      icon: ArrowUpRight,
      color: 'text-[#6B7280]',
      activeColor: 'text-[#00BFA6]',
      bgColor: 'bg-transparent',
      activeBgColor: 'bg-[#00BFA6]/10',
    },
    {
      id: 'donate',
      label: t('nav.donate'),
      icon: Heart,
      color: 'text-[#6B7280]',
      activeColor: 'text-[#00BFA6]',
      bgColor: 'bg-transparent',
      activeBgColor: 'bg-[#00BFA6]/10',
    },
    {
      id: 'settings',
      label: t('nav.settings'),
      icon: Settings,
      color: 'text-[#6B7280]',
      activeColor: 'text-[#00BFA6]',
      bgColor: 'bg-transparent',
      activeBgColor: 'bg-[#00BFA6]/10',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? `${tab.activeColor} ${tab.activeBgColor}`
                  : `${tab.color} ${tab.bgColor}`
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
} 