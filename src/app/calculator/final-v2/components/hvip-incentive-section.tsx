'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/components/calculators/shared/formatters';
import { ExternalLink } from 'lucide-react';

// HVIP Incentive tiers
const HVIP_INCENTIVES = {
  base: { amount: 60000, label: 'Base HVIP Voucher', description: 'Standard voucher for all eligible fleets' },
  smallFleet: { amount: 90000, label: 'Small Fleet Eligible', description: 'For fleets with 20 vehicles or fewer and $5M or less in annual revenue' }
};

interface HvipIncentiveSectionProps {
  selectedTier: 'base' | 'smallFleet' | '';
  onTierChange: (tier: 'base' | 'smallFleet') => void;
  onIncentiveUpdate: (amount: number) => void;
}

export default function HvipIncentiveSection({
  selectedTier,
  onTierChange,
  onIncentiveUpdate
}: HvipIncentiveSectionProps) {
  
  // Update incentive amount when tier changes (only if tier is selected)
  React.useEffect(() => {
    if (selectedTier && HVIP_INCENTIVES[selectedTier as keyof typeof HVIP_INCENTIVES]) {
      onIncentiveUpdate(HVIP_INCENTIVES[selectedTier as keyof typeof HVIP_INCENTIVES].amount);
    }
  }, [selectedTier, onIncentiveUpdate]);

  const handleTierChange = (tier: 'base' | 'smallFleet') => {
    onTierChange(tier);
  };

  return (
    <div className="space-y-6">
      
      {/* HVIP Information */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="text-sm font-medium text-green-800 mb-2">
          HVIP (Hybrid and Zero-Emission Truck and Bus Voucher Incentive Project)
        </div>
        <div className="text-sm text-green-600">
          California&apos;s HVIP program provides vouchers to reduce the purchase price of clean commercial vehicles. 
          Select your eligibility tier below.
        </div>
      </div>

      {/* Tier Selection */}
      <div className="grid gap-4">
        {Object.entries(HVIP_INCENTIVES).map(([key, tier]) => (
          <Card 
            key={key}
            className={`cursor-pointer transition-all ${
              selectedTier === key ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleTierChange(key as any)}
          >
            <CardContent className="p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="sr-only"
                  value={key}
                  checked={selectedTier === key}
                  onChange={() => handleTierChange(key as any)}
                />
                <div className="flex flex-1 items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {tier.label}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {tier.description}
                    </div>
                    <div className="text-xs text-gray-500">
                      Voucher reduces upfront vehicle cost
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(tier.amount)}
                    </div>
                    <div className="text-xs text-green-500 font-medium">
                      Incentive
                    </div>
                  </div>
                </div>
              </label>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* Selected Summary */}
      {selectedTier ? (
        <div className="bg-gray-50 border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Selected HVIP Tier
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">
                {HVIP_INCENTIVES[selectedTier as keyof typeof HVIP_INCENTIVES].label}
              </div>
              <div className="text-sm text-gray-600">
                {HVIP_INCENTIVES[selectedTier as keyof typeof HVIP_INCENTIVES].description}
              </div>
            </div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(HVIP_INCENTIVES[selectedTier as keyof typeof HVIP_INCENTIVES].amount)}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-sm font-medium text-blue-800 mb-1">
            Choose Your HVIP Tier
          </div>
          <div className="text-sm text-blue-600">
            Select your voucher eligibility above to see your incentive amount
          </div>
        </div>
      )}
      
    </div>
  );
}