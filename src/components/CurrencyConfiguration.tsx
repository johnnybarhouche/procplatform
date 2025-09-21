'use client';

import React, { useState, useEffect } from 'react';
import { CurrencyConfig } from '@/types/admin';

interface CurrencyConfigurationProps {
  currency: CurrencyConfig;
  onUpdate: (config: CurrencyConfig) => void;
}

const CurrencyConfiguration: React.FC<CurrencyConfigurationProps> = ({ currency, onUpdate }) => {
  const [localConfig, setLocalConfig] = useState<CurrencyConfig>(currency);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testAmount, setTestAmount] = useState<number>(1000);
  const [testResult, setTestResult] = useState<{ aed: number; usd: number } | null>(null);

  useEffect(() => {
    setLocalConfig(currency);
  }, [currency]);

  const handleRateChange = (newRate: number) => {
    setLocalConfig(prev => ({
      ...prev,
      usd_rate: newRate
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch('/api/admin/currency', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ usd_rate: localConfig.usd_rate })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update currency configuration');
      }

      const result = await response.json();
      onUpdate(result.currency);
      setMessage({ type: 'success', text: 'Currency configuration updated successfully' });
    } catch (error) {
      console.error('Error updating currency configuration:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update currency configuration' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConversion = () => {
    const aedAmount = testAmount;
    const usdAmount = aedAmount / localConfig.usd_rate;
    setTestResult({ aed: aedAmount, usd: usdAmount });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-text">Currency Configuration</h3>
          <p className="text-sm text-brand-text/70">Configure base currency and exchange rates</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Current Configuration */}
      <div className="bg-brand-surface rounded-lg shadow p-6">
        <h4 className="text-md font-semibold text-brand-text mb-4">Current Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">Base Currency</label>
            <div className="px-3 py-2 bg-brand-surface border border-brand-text/20 rounded-md">
              <span className="text-sm font-medium text-brand-text">{localConfig.base_currency}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">USD Exchange Rate</label>
            <input
              type="number"
              value={localConfig.usd_rate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              step="0.0001"
              min="0"
            />
            <p className="text-xs text-brand-text/60 mt-1">1 USD = {localConfig.usd_rate} AED</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">Last Updated</label>
            <div className="px-3 py-2 bg-brand-surface border border-brand-text/20 rounded-md">
              <span className="text-sm text-brand-text">{formatDate(localConfig.last_updated)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Conversion Test */}
      <div className="bg-brand-surface rounded-lg shadow p-6">
        <h4 className="text-md font-semibold text-brand-text mb-4">Currency Conversion Test</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">Test Amount (AED)</label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-brand-text/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              min="0"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleTestConversion}
              className="w-full px-4 py-2 bg-status-success text-white rounded-md hover:bg-status-success/90"
            >
              Test Conversion
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text/80 mb-1">Result</label>
            {testResult ? (
              <div className="px-3 py-2 bg-brand-surface border border-brand-text/20 rounded-md">
                <div className="text-sm">
                  <div>{formatCurrency(testResult.aed, 'AED')} = {formatCurrency(testResult.usd, 'USD')}</div>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2 bg-brand-surface border border-brand-text/20 rounded-md text-sm text-brand-text/60">
                Click &quot;Test Conversion&quot; to see result
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exchange Rate Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-md font-semibold text-blue-900 mb-2">Exchange Rate Information</h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• Base currency is set to AED (United Arab Emirates Dirham)</p>
          <p>• USD rate is used for international transactions and reporting</p>
          <p>• Rate should be updated regularly to reflect current market conditions</p>
          <p>• All financial calculations in the system use this rate for USD conversions</p>
        </div>
      </div>

      {/* Rate History (Mock) */}
      <div className="bg-brand-surface rounded-lg shadow p-6">
        <h4 className="text-md font-semibold text-brand-text mb-4">Recent Rate Changes</h4>
        <div className="space-y-3">
          {[
            { rate: 3.6725, date: new Date().toISOString(), user: 'admin@company.com' },
            { rate: 3.6710, date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), user: 'admin@company.com' },
            { rate: 3.6730, date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), user: 'admin@company.com' }
          ].map((entry, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-brand-text/10 last:border-b-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-brand-text">{entry.rate}</span>
                <span className="text-sm text-brand-text/70">{formatDate(entry.date)}</span>
              </div>
              <span className="text-sm text-brand-text/60">{entry.user}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-brand-surface rounded-lg p-4">
        <h4 className="text-sm font-medium text-brand-text mb-2">Configuration Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-brand-text/70">Base Currency:</span>
            <span className="ml-2 font-medium">{localConfig.base_currency}</span>
          </div>
          <div>
            <span className="text-brand-text/70">USD Rate:</span>
            <span className="ml-2 font-medium">{localConfig.usd_rate}</span>
          </div>
          <div>
            <span className="text-brand-text/70">Last Updated:</span>
            <span className="ml-2 font-medium">{formatDate(localConfig.last_updated)}</span>
          </div>
          <div>
            <span className="text-brand-text/70">Updated By:</span>
            <span className="ml-2 font-medium">{localConfig.updated_by}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConfiguration;
