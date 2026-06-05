import React, { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './Button';

export const ResultActions = ({ content, title = 'Analysis Result' }) => {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        // Extract text content if it's an object/result
        const textToCopy = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const textToSave = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        const blob = new Blob([textToSave], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex gap-2 mb-4">
            <Button variant="secondary" onClick={handleCopy} className="text-sm py-1.5 px-3 h-auto">
                {copied ? (
                    <>
                        <Check className="w-4 h-4 mr-2" />
                        {t('ux.actions.copied')}
                    </>
                ) : (
                    <>
                        <Copy className="w-4 h-4 mr-2" />
                        {t('ux.actions.copy')}
                    </>
                )}
            </Button>

            <Button variant="secondary" onClick={handleDownload} className="text-sm py-1.5 px-3 h-auto">
                <Download className="w-4 h-4 mr-2" />
                {t('ux.actions.downloadParams')}
            </Button>
        </div>
    );
};
