'use client';

import { Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const donationOrganizations = [
  {
    name: 'Médicos Sem Fronteiras',
    description: 'Ajuda humanitária em crises',
    logo: '🏥',
    url: 'https://www.msf.org.br',
    category: 'Saúde'
  },
  {
    name: 'Instituto Ayrton Senna',
    description: 'Educação para crianças',
    logo: '🎓',
    url: 'https://institutoayrtonsenna.org.br',
    category: 'Educação'
  },
  {
    name: 'WWF Brasil',
    description: 'Conservação ambiental',
    logo: '🌿',
    url: 'https://www.wwf.org.br',
    category: 'Meio Ambiente'
  }
];

export default function DonationSection() {
  return (
    <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <Heart size={16} className="text-white" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Apoie ONGs</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Faça a diferença apoiando organizações que transformam vidas
      </p>
      
      <div className="space-y-3">
        {donationOrganizations.map((org, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{org.logo}</span>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">{org.name}</h3>
                <p className="text-xs text-gray-500">{org.description}</p>
                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full mt-1">
                  {org.category}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(org.url, '_blank')}
              className="text-green-600 hover:text-green-700"
            >
              <ExternalLink size={14} />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          As doações são direcionadas diretamente às organizações
        </p>
      </div>
    </div>
  );
} 