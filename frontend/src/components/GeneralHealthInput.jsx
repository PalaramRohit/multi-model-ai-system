import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mic } from 'lucide-react';

export const GeneralHealthInput = ({ value, onChange, onSubmit, loading }) => {
    const { t } = useLanguage();

    return (
        <div className="space-y-4">
            <div className="relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={t('health.inputPlaceholder')}
                    className="input-field w-full min-h-[150px] resize-none p-4 pr-12 text-lg"
                />
                <button
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                    title={t('health.voiceInput')}
                    // TODO: Implement Speech-to-Text here
                    onClick={() => alert("Voice input coming soon!")}
                >
                    <Mic className="w-5 h-5" />
                </button>
            </div>

            <div className="flex justify-between items-center text-sm text-white/40 px-1">
                <span>* General symptoms only</span>
                <span>{value.length}/500</span>
            </div>

            <button
                onClick={onSubmit}
                disabled={!value.trim() || loading}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${!value.trim() || loading
                        ? 'bg-glass border border-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white shadow-lg shadow-red-500/20'
                    }`}
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Processing...
                    </div>
                ) : (
                    t('health.analyzeBtn')
                )}
            </button>
        </div>
    );
};
