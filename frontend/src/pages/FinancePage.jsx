import React, { useState } from 'react';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { financeService } from '../services/hubServices.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import ReactMarkdown from 'react-markdown';
import { Upload, Wallet, FileText, Activity, Building, ShieldCheck, Info } from 'lucide-react';
import { Disclaimer } from '../components/Disclaimer.jsx';
import { HubGuide } from '../components/HubGuide.jsx';
import { ResultActions } from '../components/ResultActions.jsx';
import { Feedback } from '../components/Feedback.jsx';
import { Input } from '../components/Input.jsx';

const FinancePage = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('spending'); // 'spending' or 'hospital'

  // Spending State
  const [transFile, setTransFile] = useState(null);
  const [budgetFile, setBudgetFile] = useState(null);
  const [userGoals, setUserGoals] = useState('');
  const [spendingLoading, setSpendingLoading] = useState(false);
  const [spendingResult, setSpendingResult] = useState(null);

  // Hospital Bill State
  const [billForm, setBillForm] = useState({
    city_tier: 'Tier 2',
    hospital_type: 'Private',
    ward_type: 'General',
    duration: '3',
    icu_days: '0',
    surgery_type: 'None',
    insurance_cover: '0'
  });
  const [billLoading, setBillLoading] = useState(false);
  const [billResult, setBillResult] = useState(null);

  // Spending Handlers
  const handleTransChange = (e) => {
    setTransFile(e.target.files[0]);
    setSpendingResult(null);
  };

  const handleBudgetChange = (e) => {
    setBudgetFile(e.target.files[0]);
  };

  const handleAnalyzeSpending = async () => {
    if (!transFile) {
      alert('Please upload a transactions CSV file');
      return;
    }
    setSpendingLoading(true);
    setSpendingResult(null);
    try {
      const formData = new FormData();
      formData.append('transactions', transFile);
      formData.append('language', language);
      formData.append('user_goals', userGoals);
      if (budgetFile) formData.append('budget', budgetFile);

      const data = await financeService.analyze(formData);
      setSpendingResult(data.report || data);
    } catch (error) {
      console.error('Analysis error:', error);
      alert(error.response?.data?.error || 'Analysis failed');
    } finally {
      setSpendingLoading(false);
    }
  };

  // Hospital Bill Handlers
  const handleBillChange = (e) => {
    setBillForm({ ...billForm, [e.target.name]: e.target.value });
  };

  const handlePredictBill = async (e) => {
    e.preventDefault();
    setBillLoading(true);
    setBillResult(null);
    try {
      const data = await financeService.predictBill(billForm);
      setBillResult(data.result);
    } catch (error) {
      console.error('Prediction error:', error);
      alert(error.response?.data?.error || 'Prediction failed');
    } finally {
      setBillLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

        {/* Header */}
        <div>
          <div className="flex items-center mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              {t('landing.hubs.finance')}
            </h1>
            <HubGuide hub="finance" />
          </div>
          <p className="text-white/60">AI-powered financial analysis and estimation tools</p>
        </div>

        <Disclaimer />

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('spending')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'spending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-white/60 hover:bg-glass'}`}
          >
            <Wallet className="w-5 h-5" />
            Spending AI
          </button>
          <button
            onClick={() => setActiveTab('hospital')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'hospital' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-white/60 hover:bg-glass'}`}
          >
            <Activity className="w-5 h-5" />
            Hospital Bill AI
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'spending' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
            <Card>
              <h2 className="text-xl font-semibold mb-4">Upload Transactions</h2>
              <div className="space-y-4">
                {/* Transaction Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-80">Transactions CSV (Required)</label>
                  <label className="block border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-yellow-500/50 transition-all">
                    {transFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm">{transFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 mb-2 text-white/40" />
                        <span className="text-sm opacity-60">Upload CSV</span>
                      </div>
                    )}
                    <input type="file" accept=".csv" onChange={handleTransChange} className="hidden" />
                  </label>
                </div>

                {/* Budget Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 opacity-80">Budget CSV (Optional)</label>
                  <label className="block border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-yellow-500/50 transition-all">
                    {budgetFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm">{budgetFile.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-6 h-6 mb-2 text-white/40" />
                        <span className="text-sm opacity-60">Upload CSV</span>
                      </div>
                    )}
                    <input type="file" accept=".csv" onChange={handleBudgetChange} className="hidden" />
                  </label>
                </div>

                <textarea
                  placeholder="Financial goals (optional)"
                  value={userGoals}
                  onChange={(e) => setUserGoals(e.target.value)}
                  className="input-field w-full min-h-[100px] resize-none"
                />

                <Button onClick={handleAnalyzeSpending} disabled={!transFile || spendingLoading} className="w-full">
                  {spendingLoading ? <LoadingSpinner size="sm" /> : t('common.analyze')}
                </Button>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-4">Analysis Report</h2>
              {spendingResult ? (
                <div className="space-y-4">
                  <ResultActions content={spendingResult} title="Spending_Report" />
                  <div className="prose prose-invert max-w-none text-sm">
                    <ReactMarkdown>{spendingResult}</ReactMarkdown>
                  </div>
                  <Feedback />
                </div>
              ) : (
                <div className="text-center py-12 text-white/40">
                  <Wallet className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Upload transactions to generate report</p>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
            <Card>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-red-400" />
                Bill Parameters
              </h2>
              <form onSubmit={handlePredictBill} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-white/70 mb-2">City Tier</label>
                    <select
                      name="city_tier"
                      value={billForm.city_tier}
                      onChange={handleBillChange}
                      className="input-field w-full appearance-none bg-dark-blue"
                    >
                      <option value="Tier 1">Tier 1 (Metro)</option>
                      <option value="Tier 2">Tier 2 (City)</option>
                      <option value="Tier 3">Tier 3 (Town)</option>
                    </select>
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-white/70 mb-2">Hospital Type</label>
                    <select
                      name="hospital_type"
                      value={billForm.hospital_type}
                      onChange={handleBillChange}
                      className="input-field w-full appearance-none bg-dark-blue"
                    >
                      <option value="Government">Government</option>
                      <option value="Private">Private</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-white/70 mb-2">Ward Type</label>
                    <select
                      name="ward_type"
                      value={billForm.ward_type}
                      onChange={handleBillChange}
                      className="input-field w-full appearance-none bg-dark-blue"
                    >
                      <option value="General">General Ward</option>
                      <option value="Single">Single Room</option>
                      <option value="ICU">ICU Only</option>
                    </select>
                  </div>
                  <Input label="Total Days" type="number" min="1" name="duration" value={billForm.duration} onChange={handleBillChange} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="ICU Days (if any)" type="number" min="0" name="icu_days" value={billForm.icu_days} onChange={handleBillChange} />
                  <div className="w-full">
                    <label className="block text-sm font-medium text-white/70 mb-2">Surgery Type</label>
                    <select
                      name="surgery_type"
                      value={billForm.surgery_type}
                      onChange={handleBillChange}
                      className="input-field w-full appearance-none bg-dark-blue"
                    >
                      <option value="None">None</option>
                      <option value="Minor">Minor (e.g. Cataract)</option>
                      <option value="Major">Major (e.g. Knee Rep.)</option>
                      <option value="Complex">Complex (e.g. Transplant)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Input
                    label="Insurance Coverage (₹)"
                    type="number"
                    min="0"
                    name="insurance_cover"
                    value={billForm.insurance_cover}
                    onChange={handleBillChange}
                    placeholder="0"
                  />
                  <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Deduction applied after total
                  </p>
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={billLoading} className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50">
                    {billLoading ? <LoadingSpinner size="sm" /> : "Calculate Estimate"}
                  </Button>
                </div>
                <p className="text-center text-xs text-white/30">
                  *Estimates use current medical inflation data
                </p>
              </form>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-4">Estimated Breakdown</h2>
              {billResult ? (
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-red-500/10 to-transparent p-6 rounded-xl border border-red-500/20">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-white/60">Estimated Total</span>
                      <span className="text-2xl font-bold">₹{billResult.estimated_cost.min.toLocaleString()} - ₹{billResult.estimated_cost.max.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-white/10">
                      <span className="text-red-400 font-semibold flex items-center gap-2">
                        <Wallet className="w-4 h-4" /> Net Payable
                      </span>
                      <span className="text-3xl font-bold text-red-400">₹{billResult.net_payable.min.toLocaleString()} - ₹{billResult.net_payable.max.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3 text-sm">
                    <BreakdownRow label="Room Charges" val={billResult.breakdown.room_charges} />
                    <BreakdownRow label="ICU Charges" val={billResult.breakdown.icu_charges} />
                    <BreakdownRow label="Surgery" val={billResult.breakdown.surgery_cost} />
                    <BreakdownRow label="Professional Fees" val={billResult.breakdown.professional_fees} />
                    <BreakdownRow label="Pharmacy & Consumables" val={billResult.breakdown.pharmacy_consumables} />
                    <BreakdownRow label="Lab & Diagnostics" val={billResult.breakdown.lab_diagnostics} />
                  </div>

                  {/* Factors */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                    <FactorTag label={`City: ${billResult.factors.city_tier}`} />
                    <FactorTag label={`Hospital: ${billResult.factors.hospital_type}`} />
                    <FactorTag label={`Inflation: ${(billResult.factors.inflation_factor * 100 - 100).toFixed(0)}%`} />
                    {billResult.insurance_applied > 0 && <FactorTag label={`Insured: ₹${billResult.insurance_applied.toLocaleString()}`} color="green" />}
                  </div>

                  <div className="flex items-start gap-2 bg-yellow-500/10 p-3 rounded-lg text-xs text-yellow-200/80">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>Disclaimer: This is a data-driven estimate based on regional factors. Actual hospital bills may vary significantly based on medical complications.</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-white/40">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Enter details to estimate bill</p>
                </div>
              )}
            </Card>
          </div>
        )}

      </div>
    </Layout >
  );
};

const BreakdownRow = ({ label, val }) => {
  if (val.max === 0) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-white/60">{label}</span>
      <span className="font-medium">₹{val.min.toLocaleString()} - ₹{val.max.toLocaleString()}</span>
    </div>
  );
};

const FactorTag = ({ label, color = "blue" }) => (
  <span className={`px-2 py-1 rounded-md bg-${color}-500/20 text-${color}-400 text-xs border border-${color}-500/30`}>
    {label}
  </span>
);

export default FinancePage;
