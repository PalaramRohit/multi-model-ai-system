import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Disclaimer = ({ type = 'banner', className = '' }) => {
    const { t } = useLanguage();

    if (type === 'footer') {
        return (
            <div className={`mt-4 pt-4 border-t border-white/10 text-center text-xs text-white/40 flex items-center justify-center gap-2 ${className}`}>
                <Info className="w-3 h-3" />
                <p>{t('ux.disclaimer.footer')}</p>
            </div>
        );
    }

    return (
        <div className={`rounded-xl bg-orange-500/10 border border-orange-500/20 p-4 mb-6 flex items-start gap-3 backdrop-blur-sm ${className}`}>
            <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
                <h3 className="text-orange-400 font-medium mb-1">{t('ux.disclaimer.title')}</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                    {t('ux.disclaimer.text')}
                </p>
            </div>
        </div>
    );
};
