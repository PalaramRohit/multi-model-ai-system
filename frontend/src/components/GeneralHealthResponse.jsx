import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Stethoscope, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ResultActions } from './ResultActions.jsx';
import { Feedback } from './Feedback.jsx';
import { Disclaimer } from './Disclaimer.jsx';

export const GeneralHealthResponse = ({ result }) => {
    const { t } = useLanguage();

    if (!result) return null;

    return (
        <div className="animate-slide-up space-y-6">

            {/* Action Buttons (Copy/Download) */}
            <ResultActions content={JSON.stringify(result, null, 2)} title="Health_Report" />

            {/* Section 1: What this could be */}
            <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-3">
                    <Stethoscope className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-semibold text-blue-100">{t('health.sections.possible')}</h3>
                </div>
                <div className="text-white/80 leading-relaxed">
                    {/* Mock Data Rendering */}
                    <ul className="list-disc list-inside space-y-1">
                        {result.possibleCauses?.map((cause, idx) => (
                            <li key={idx}>{cause}</li>
                        )) || <p>Analysis pending backend integration...</p>}
                    </ul>
                </div>
            </div>

            {/* Section 2: Immediate Actions */}
            <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-green-100">{t('health.sections.actions')}</h3>
                </div>
                <div className="text-white/80 leading-relaxed">
                    <ul className="list-disc list-inside space-y-1">
                        {result.homeRemedies?.map((remedy, idx) => (
                            <li key={idx}>{remedy}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Section 3: Red Flags / When to seek help */}
            <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <h3 className="text-lg font-semibold text-red-100">{t('health.sections.alert')}</h3>
                </div>
                <div className="text-white/80 leading-relaxed">
                    <ul className="list-disc list-inside space-y-1">
                        {result.redFlags?.map((flag, idx) => (
                            <li key={idx}>{flag}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <Feedback />

            {/* Explicit Disclaimer for this section */}
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/80 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                    <strong>IMPORTANT:</strong> This is an AI-generated informational summary, not a medical diagnosis.
                    Always consult a doctor for professional medical advice, especially for severe or persistent symptoms.
                </p>
            </div>
        </div>
    );
};
