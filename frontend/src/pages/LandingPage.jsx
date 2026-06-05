import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Sprout, 
  GraduationCap, 
  Wallet, 
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Cpu
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { LanguageSwitcher } from '../components/LanguageSwitcher.jsx';
import { Button } from '../components/Button.jsx';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const hubs = [
    {
      id: 'medical',
      icon: Activity,
      title: t('landing.hubs.medical'),
      color: 'text-red-400',
      gradient: 'from-red-500/20 to-red-600/5',
    },
    {
      id: 'agriculture',
      icon: Sprout,
      title: t('landing.hubs.agriculture'),
      color: 'text-green-400',
      gradient: 'from-green-500/20 to-green-600/5',
    },
    {
      id: 'finance',
      icon: Wallet,
      title: t('landing.hubs.finance'),
      color: 'text-yellow-400',
      gradient: 'from-yellow-500/20 to-yellow-600/5',
    },
    {
      id: 'student',
      icon: GraduationCap,
      title: t('landing.hubs.student'),
      color: 'text-blue-400',
      gradient: 'from-blue-500/20 to-blue-600/5',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-blue relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 bg-navy/50 backdrop-blur-glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-blue to-neon-cyan flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-dark-blue" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
              Multi-Model AI
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" onClick={() => navigate('/login')}>
              {t('nav.login')}
            </Button>
            <Button onClick={() => navigate('/signup')}>
              {t('nav.signup')}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 mb-8"
          >
            <Zap className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm font-semibold text-neon-cyan">Powered by Advanced AI</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-neon-cyan to-neon-blue bg-clip-text text-transparent">
            {t('landing.hero.title')}
          </h1>
          
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button onClick={() => navigate('/signup')} className="flex items-center gap-2">
              {t('landing.hero.cta')}
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="secondary" onClick={() => navigate('/login')}>
              {t('landing.hero.explore')}
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-neon-cyan" />
              <span>Gemini AI</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-neon-cyan" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon-cyan" />
              <span>Fast Processing</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* AI Hubs Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
            {t('nav.hubs')}
          </h2>
          <p className="text-white/60 text-lg">
            Specialized AI solutions for every domain
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hubs.map((hub, index) => {
            const Icon = hub.icon;
            return (
              <motion.div
                key={hub.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:border-neon-cyan/50 cursor-pointer group"
                onClick={() => navigate('/login')}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${hub.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-7 h-7 ${hub.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{hub.title}</h3>
                <p className="text-white/60 text-sm mb-4">
                  Advanced AI analysis and insights
                </p>
                <div className="flex items-center gap-2 text-neon-cyan text-sm font-semibold">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-navy/30 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-white/60 text-sm">
          <p>&copy; 2024 Multi-Model AI Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
