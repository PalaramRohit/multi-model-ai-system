import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Feedback = () => {
    const { t } = useLanguage();
    const [voted, setVoted] = useState(null); // 'up' or 'down'

    if (voted) {
        return (
            <div className="mt-4 text-center p-2 rounded-lg bg-white/5 animate-fade-in">
                <p className="text-sm text-green-400">{t('ux.feedback.thanks')}</p>
            </div>
        );
    }

    return (
        <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-white/50 mb-3 text-center">{t('ux.feedback.title')}</p>
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => setVoted('up')}
                    className="p-2 rounded-full hover:bg-green-500/20 text-white/40 hover:text-green-400 transition-colors"
                >
                    <ThumbsUp className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setVoted('down')}
                    className="p-2 rounded-full hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                >
                    <ThumbsDown className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
