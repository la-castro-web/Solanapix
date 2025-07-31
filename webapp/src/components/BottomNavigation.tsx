'use client';

import { useState } from 'react';
import { Wallet, QrCode, BarChart3, Heart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    {
      id: 'home',
      label: 'Início',
      icon: Wallet,
      color: 'text-cyan-600',
      activeColor: 'text-cyan-600',
    },
    {
      id: 'receive',
      label: 'Receber',
      icon: QrCode,
      color: 'text-purple-600',
      activeColor: 'text-purple-600',
    },
    {
      id: 'donate',
      label: 'Doar',
      icon: Heart,
      color: 'text-green-600',
      activeColor: 'text-green-600',
    },
    {
      id: 'settings',
      label: 'Config',
      icon: Settings,
      color: 'text-gray-600',
      activeColor: 'text-gray-800',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1",
                isActive 
                  ? "bg-gray-50" 
                  : "hover:bg-gray-50"
              )}
            >
              <Icon 
                size={24} 
                className={cn(
                  "mb-1 transition-colors",
                  isActive ? tab.activeColor : tab.color
                )} 
              />
              <span 
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? tab.activeColor : "text-gray-500"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
} 