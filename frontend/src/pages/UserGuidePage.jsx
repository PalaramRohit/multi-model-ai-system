import React from 'react';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { ShieldAlert, BookOpen, Activity, Sprout, Wallet, GraduationCap, AlertTriangle, UserCheck, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const UserGuidePage = () => {
    const { t } = useLanguage();

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

                {/* Header */}
                <div className="text-center space-y-2 mb-10">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-blue to-neon-cyan bg-clip-text text-transparent">
                        {t('guidePage.title')}
                    </h1>
                    <p className="text-white/60 text-lg">
                        {t('guidePage.subtitle')}
                    </p>
                </div>

                {/* General Disclaimer */}
                <div className="border border-red-500/30 bg-red-500/10 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldAlert className="w-24 h-24 text-red-500" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6" />
                            {t('guidePage.disclaimer.title')}
                        </h2>
                        <p className="text-white/80 leading-relaxed text-lg">
                            {t('guidePage.disclaimer.text')}
                        </p>
                    </div>
                </div>

                {/* About Section */}
                <Card>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-neon-cyan/20 rounded-xl">
                            <BookOpen className="w-6 h-6 text-neon-cyan" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{t('guidePage.about.title')}</h2>
                            <p className="text-white/70 leading-relaxed">
                                {t('guidePage.about.text')}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModuleCard
                        icon={Activity}
                        title={t('guidePage.modules.medical.title')}
                        desc={t('guidePage.modules.medical.desc')}
                        limit={t('guidePage.modules.medical.limitation')}
                        color="text-red-400"
                        bg="bg-red-500/10"
                    />
                    <ModuleCard
                        icon={Sprout}
                        title={t('guidePage.modules.agriculture.title')}
                        desc={t('guidePage.modules.agriculture.desc')}
                        limit={t('guidePage.modules.agriculture.limitation')}
                        color="text-green-400"
                        bg="bg-green-500/10"
                    />
                    <ModuleCard
                        icon={Wallet}
                        title={t('guidePage.modules.finance.title')}
                        desc={t('guidePage.modules.finance.desc')}
                        limit={t('guidePage.modules.finance.limitation')}
                        color="text-yellow-400"
                        bg="bg-yellow-500/10"
                    />
                    <ModuleCard
                        icon={GraduationCap}
                        title={t('guidePage.modules.student.title')}
                        desc={t('guidePage.modules.student.desc')}
                        limit={t('guidePage.modules.student.limitation')}
                        color="text-blue-400"
                        bg="bg-blue-500/10"
                    />
                </div>

                {/* Understanding AI & Safety Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-neon-blue" />
                            {t('guidePage.understanding.title')}
                        </h3>
                        <ul className="space-y-3">
                            {t('guidePage.understanding.points')?.map((point, i) => (
                                <li key={i} className="flex gap-3 text-white/70">
                                    <span className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-2 flex-shrink-0"></span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-orange-400" />
                            {t('guidePage.safety.title')}
                        </h3>
                        <p className="text-white/70 leading-relaxed mb-6">
                            {t('guidePage.safety.text')}
                        </p>
                        <div className="pt-4 border-t border-white/10">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-white/60" />
                                {t('guidePage.privacy.title')}
                            </h4>
                            <p className="text-sm text-white/60">
                                {t('guidePage.privacy.text')}
                            </p>
                        </div>
                    </Card>
                </div>

            </div>
        </Layout>
    );
};

const ModuleCard = ({ icon: Icon, title, desc, limit, color, bg }) => (
    <Card className="h-full flex flex-col">
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <p className="text-white/70 text-sm mb-4 flex-1">{desc}</p>
        <div className="bg-black/20 p-3 rounded-lg border border-white/5">
            <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1">Limitation</p>
            <p className="text-sm text-white/80">{limit}</p>
        </div>
    </Card>
);

export default UserGuidePage;
