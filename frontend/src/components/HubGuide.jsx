import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';

export const HubGuide = ({ hub }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block ml-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white/40 hover:text-cyan-400 transition-colors"
                title={t('ux.guide.title')}
            >
                <HelpCircle className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="absolute top-full left-0 mt-2 w-80 z-50 p-0"
                        >
                            <div className="glass-card bg-[#0f1218] border border-white/10 rounded-xl p-5 shadow-2xl relative">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-3 right-3 text-white/40 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <h3 className="flex items-center gap-2 text-lg font-semibold text-cyan-400 mb-3">
                                    <HelpCircle className="w-5 h-5" />
                                    {t('ux.guide.title')}
                                </h3>

                                <p className="text-sm text-white/80 leading-relaxed">
                                    {t(`ux.guide.${hub}`)}
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
