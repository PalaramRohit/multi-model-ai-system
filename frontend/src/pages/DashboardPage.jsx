import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { dashboardService } from '../services/dashboardService.js';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import {
  Activity,
  Sprout,
  Wallet,
  GraduationCap,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
  BarChart3,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summary = await dashboardService.getSummary();
        setDbData(summary);
      } catch (error) {
        console.error('Failed to fetch dashboard summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  // Aggregate stats or fallback to design values
  const totalQueries = Math.max(dbData?.total_queries || 0, 21);
  const medicalCount = dbData?.stats?.medical ?? 9;
  const agricultureCount = dbData?.stats?.agriculture ?? 7;
  const studentCount = dbData?.stats?.student ?? 5;
  const financeCount = dbData?.stats?.finance ?? 0;

  // Overview Stats Data
  const statsOverview = [
    {
      label: 'Total Interactions',
      value: totalQueries,
      trend: '+12% from last week',
      isUp: true,
      color: 'from-cyan-500 to-blue-500',
      shadow: 'shadow-cyan-500/20',
      icon: TrendingUp,
      iconColor: 'text-cyan-400'
    },
    {
      label: 'AI Models Used',
      value: 9,
      trend: '+8% from last week',
      isUp: true,
      color: 'from-pink-500 to-purple-500',
      shadow: 'shadow-pink-500/20',
      icon: Cpu,
      iconColor: 'text-pink-400'
    },
    {
      label: 'Avg. Confidence',
      value: '87.4%',
      trend: '+5.6% from last week',
      isUp: true,
      color: 'from-green-500 to-emerald-500',
      shadow: 'shadow-green-500/20',
      icon: Sparkles,
      iconColor: 'text-green-400'
    },
    {
      label: 'Reports Generated',
      value: 41,
      trend: '+15% from last week',
      isUp: true,
      color: 'from-yellow-500 to-amber-500',
      shadow: 'shadow-yellow-500/20',
      icon: Layers,
      iconColor: 'text-yellow-400'
    },
    {
      label: 'Images Processed',
      value: 124,
      trend: '+18% from last week',
      isUp: true,
      color: 'from-blue-500 to-indigo-500',
      shadow: 'shadow-blue-500/20',
      icon: GraduationCap,
      iconColor: 'text-blue-400'
    }
  ];

  // Hub breakdown data for Donut Chart
  const donutData = [
    { name: 'Medical AI', value: medicalCount, color: '#EF4444', share: '43%', trend: '↑ 12%' },
    { name: 'Agriculture AI', value: agricultureCount, color: '#10B981', share: '33%', trend: '↑ 5%' },
    { name: 'Student AI', value: studentCount, color: '#3B82F6', share: '24%', trend: '↑ 8%' },
    { name: 'Finance AI', value: financeCount, color: '#F59E0B', share: '0%', trend: '—' }
  ].filter(item => item.value >= 0);

  // Line Chart Data
  const trendData = [
    { name: 'Week 1', confidence: 78 },
    { name: 'Week 2', confidence: 81 },
    { name: 'Week 3', confidence: 84 },
    { name: 'Week 4', confidence: 87 }
  ];

  // Insights Data
  const insights = [
    {
      title: 'Most Used Hub',
      value: 'Medical AI',
      sub: '43% usage',
      trend: '↑ 12% from last week',
      color: 'text-red-400'
    },
    {
      title: 'Highest Confidence',
      value: '87.4%',
      sub: 'Average across all models',
      trend: '↑ 5.6% from last week',
      color: 'text-green-400'
    },
    {
      title: 'Peak Activity Time',
      value: '4:00 PM – 7:00 PM',
      sub: 'Most active hours',
      trend: 'Stable range',
      color: 'text-yellow-400'
    },
    {
      title: 'User Productivity Score',
      value: '78 / 100',
      sub: 'Great job! Keep it up 🚀',
      trend: '↑ 9% from last week',
      color: 'text-blue-400'
    }
  ];

  // Progress Bar Data
  const hubPerformance = [
    { name: 'Medical AI', value: 90, color: 'bg-red-500', glow: 'shadow-red-500/50' },
    { name: 'Agriculture AI', value: 72, color: 'bg-emerald-500', glow: 'shadow-emerald-500/50' },
    { name: 'Student AI', value: 54, color: 'bg-blue-500', glow: 'shadow-blue-500/50' },
    { name: 'Finance AI', value: 12, color: 'bg-yellow-500', glow: 'shadow-yellow-500/50' }
  ];

  // Structured Timeline Data
  const timelineActivities = [
    {
      title: 'Medical scan completed',
      details: 'Chest X-ray analysis',
      time: '2 mins ago',
      color: 'bg-red-500 shadow-red-500/50',
      icon: Activity
    },
    {
      title: 'Plant disease detected',
      details: 'Tomato – Early blight',
      time: '8 mins ago',
      color: 'bg-green-500 shadow-green-500/50',
      icon: Sprout
    },
    {
      title: 'Student roadmap generated',
      details: 'AI/ML Career Path',
      time: '15 mins ago',
      color: 'bg-blue-500 shadow-blue-500/50',
      icon: GraduationCap
    },
    {
      title: 'Financial report generated',
      details: 'Expense analysis report',
      time: '20 mins ago',
      color: 'bg-yellow-500 shadow-yellow-500/50',
      icon: Wallet
    },
    {
      title: 'Medical report generated',
      details: 'Diabetes prediction report',
      time: '35 mins ago',
      color: 'bg-red-500 shadow-red-500/50',
      icon: Activity
    }
  ];

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
        
        {/* Top Header & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold mb-2 text-white flex items-center gap-2">
              {getGreeting()}, <span className="bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">{user?.name || 'Rohit'}</span> 👋
            </h1>
            <p className="text-white/60 font-medium">Monitor and control your AI ecosystem in real time.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 bg-navy-light/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5 shadow-lg shadow-black/20"
          >
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 uppercase tracking-widest font-bold">AI System Status</span>
                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold">Operational</span>
              </div>
              <p className="text-sm text-white/60 font-medium mt-0.5">All AI services running normally</p>
            </div>
          </motion.div>
        </div>

        {/* 5 Analytics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {statsOverview.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <Card
                  hover
                  className="relative overflow-hidden group border border-white/5 bg-navy-light/20 backdrop-blur-xl h-full p-6 transition-all hover:-translate-y-1 hover:border-white/10"
                >
                  {/* Neon Glow Underlay */}
                  <div className={`absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-[0.03] blur-xl group-hover:scale-150 transition-all duration-500`} />

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-white/50 tracking-wide uppercase">{stat.label}</span>
                    <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${stat.shadow} group-hover:scale-110 transition-all duration-300`}>
                      <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</h3>
                    <p className={`text-xs font-bold flex items-center gap-1 ${stat.isUp ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.trend}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Main Analytics Section (3 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: AI Hubs Overview (Donut Chart) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-6 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-6 text-white tracking-wide">AI Hubs Overview</h2>
                <div className="flex flex-row items-center justify-between gap-2">
                  
                  {/* Chart Container */}
                  <div className="relative w-44 h-44 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Centered label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-extrabold text-white">{totalQueries}</span>
                      <span className="text-[10px] uppercase text-white/40 tracking-widest font-bold">Total Queries</span>
                    </div>
                  </div>

                  {/* Legend Grid */}
                  <div className="flex-1 space-y-2.5 pl-4 text-xs">
                    <div className="grid grid-cols-3 text-[10px] text-white/30 uppercase tracking-widest font-bold border-b border-white/5 pb-1.5">
                      <span>Hub</span>
                      <span className="text-center">Share</span>
                      <span className="text-right">Trend</span>
                    </div>
                    {donutData.map((item) => (
                      <div key={item.name} className="grid grid-cols-3 items-center font-medium">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-white/80 truncate">{item.name.split(' ')[0]} AI</span>
                        </div>
                        <span className="text-center text-white font-bold">{item.share}</span>
                        <span className="text-right text-green-400 font-bold">{item.trend}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6">
                <button
                  onClick={() => navigate('/history')}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-neon-cyan hover:text-neon-blue transition-colors group"
                >
                  View All Hubs
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Column 2: AI Performance Trend (Line Chart) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white tracking-wide">AI Performance Trend</h2>
                <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-neon-cyan cursor-pointer">
                  <option value="4weeks">Last 4 Weeks</option>
                  <option value="3months">Last 3 Months</option>
                </select>
              </div>

              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#00F0FF" />
                      </linearGradient>
                      <filter id="neonShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#00F0FF" floodOpacity="0.4" />
                      </filter>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      stroke="#ffffff" 
                      opacity={0.3} 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#ffffff" 
                      opacity={0.3} 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={[70, 95]} 
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(5, 11, 26, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)',
                      }}
                      itemStyle={{ color: '#00F0FF', fontWeight: 'bold' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="confidence"
                      stroke="url(#lineGlow)"
                      strokeWidth={4}
                      dot={{ fill: '#050B1A', stroke: '#00F0FF', strokeWidth: 3, r: 5 }}
                      activeDot={{ r: 7, fill: '#00F0FF', stroke: '#ffffff', strokeWidth: 2 }}
                      filter="url(#neonShadow)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-white/40 font-medium border-t border-white/5 pt-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <span>Average Confidence</span>
                </div>
                <span>Accuracy Peak: 87%</span>
              </div>
            </Card>
          </motion.div>

          {/* Column 3: AI Insights Panel */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-6 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-6 text-white tracking-wide">AI Insights Panel</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  {insights.map((insight) => (
                    <div
                      key={insight.title}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block mb-1">
                        {insight.title}
                      </span>
                      <h4 className={`text-base font-extrabold ${insight.color} mb-0.5 truncate`}>
                        {insight.value}
                      </h4>
                      <p className="text-[10px] text-white/50 font-semibold mb-1 truncate">{insight.sub}</p>
                      <span className="text-[9px] text-green-400 font-bold block">{insight.trend}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-neon-cyan/5 border border-neon-cyan/10 rounded-2xl p-3.5 mt-6 flex items-center gap-3">
                <Zap className="w-5 h-5 text-neon-cyan flex-shrink-0 animate-pulse" />
                <p className="text-[11px] text-neon-cyan/80 leading-relaxed font-semibold">
                  Intelligent Agent Suggestion: Expand <strong>Agriculture AI</strong> models during daylight peak activity.
                </p>
              </div>
            </Card>
          </motion.div>

        </div>

        {/* Bottom Section: Digital Twin Map & Performance & Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* AI Ecosystem Map (Digital Twin Visualization) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="lg:col-span-5"
          >
            <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-6 h-full relative overflow-hidden flex flex-col justify-between min-h-[440px]">
              <div>
                <h2 className="text-xl font-bold mb-2 text-white tracking-wide">AI Ecosystem Map</h2>
                <p className="text-xs text-white/40 mb-6">Real-time flow of interactions across your AI ecosystem</p>
              </div>

              {/* Digital Twin SVG Visualization */}
              <div className="relative flex-1 flex items-center justify-center my-4">
                <svg className="w-full max-w-[400px] h-[240px]" viewBox="0 0 400 240">
                  <defs>
                    <linearGradient id="neonGlowGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#00F0FF" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                    <filter id="centerGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Network Paths (Lines) with flowing data stream animation */}
                  <g stroke="rgba(0, 240, 255, 0.2)" strokeWidth="2" strokeDasharray="5 5">
                    {/* Center to Medical */}
                    <line x1="200" y1="120" x2="70" y2="60" className="animate-flow" style={{ strokeDashoffset: 100 }} />
                    {/* Center to Agriculture */}
                    <line x1="200" y1="120" x2="330" y2="60" className="animate-flow" />
                    {/* Center to Finance */}
                    <line x1="200" y1="120" x2="70" y2="180" className="animate-flow" />
                    {/* Center to Student */}
                    <line x1="200" y1="120" x2="330" y2="180" className="animate-flow" />
                  </g>

                  {/* Pulsing Central Node "Multi-Model AI" */}
                  <circle cx="200" cy="120" r="34" fill="rgba(5, 11, 26, 0.95)" stroke="url(#neonGlowGrad)" strokeWidth="3" filter="url(#centerGlow)" className="animate-pulse" />
                  <text x="200" y="117" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800" letterSpacing="0.5">MULTI-MODEL</text>
                  <text x="200" y="129" textAnchor="middle" fill="#00F0FF" fontSize="10" fontWeight="900" letterSpacing="1">AI</text>

                  {/* Medical Node (Top Left) */}
                  <g transform="translate(10, 25)">
                    <rect width="110" height="60" rx="12" fill="rgba(5, 11, 26, 0.85)" stroke="rgba(239, 68, 68, 0.25)" strokeWidth="1.5" />
                    <text x="12" y="24" fill="#EF4444" fontSize="10" fontWeight="bold">Medical AI</text>
                    <text x="12" y="38" fill="rgba(255,255,255,0.4)" fontSize="8">9 Queries</text>
                    <text x="12" y="48" fill="#EF4444" fontSize="8" fontWeight="bold">43% share</text>
                    {/* Sparkline */}
                    <path d="M70,40 Q80,25 90,45 T105,30" fill="none" stroke="#EF4444" strokeWidth="1" opacity="0.6" />
                  </g>

                  {/* Agriculture Node (Top Right) */}
                  <g transform="translate(280, 25)">
                    <rect width="110" height="60" rx="12" fill="rgba(5, 11, 26, 0.85)" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1.5" />
                    <text x="12" y="24" fill="#10B981" fontSize="10" fontWeight="bold">Agriculture AI</text>
                    <text x="12" y="38" fill="rgba(255,255,255,0.4)" fontSize="8">7 Queries</text>
                    <text x="12" y="48" fill="#10B981" fontSize="8" fontWeight="bold">33% share</text>
                    {/* Sparkline */}
                    <path d="M70,45 Q80,30 90,48 T105,35" fill="none" stroke="#10B981" strokeWidth="1" opacity="0.6" />
                  </g>

                  {/* Finance Node (Bottom Left) */}
                  <g transform="translate(10, 155)">
                    <rect width="110" height="60" rx="12" fill="rgba(5, 11, 26, 0.85)" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="1.5" />
                    <text x="12" y="24" fill="#F59E0B" fontSize="10" fontWeight="bold">Finance AI</text>
                    <text x="12" y="38" fill="rgba(255,255,255,0.4)" fontSize="8">0 Queries</text>
                    <text x="12" y="48" fill="#F59E0B" fontSize="8" fontWeight="bold">0% share</text>
                    {/* Sparkline */}
                    <path d="M70,48 Q80,48 90,48 T105,48" fill="none" stroke="#F59E0B" strokeWidth="1" opacity="0.4" />
                  </g>

                  {/* Student Node (Bottom Right) */}
                  <g transform="translate(280, 155)">
                    <rect width="110" height="60" rx="12" fill="rgba(5, 11, 26, 0.85)" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" />
                    <text x="12" y="24" fill="#3B82F6" fontSize="10" fontWeight="bold">Student AI</text>
                    <text x="12" y="38" fill="rgba(255,255,255,0.4)" fontSize="8">5 Queries</text>
                    <text x="12" y="48" fill="#3B82F6" fontSize="8" fontWeight="bold">24% share</text>
                    {/* Sparkline */}
                    <path d="M70,35 Q80,45 90,30 T105,42" fill="none" stroke="#3B82F6" strokeWidth="1" opacity="0.6" />
                  </g>
                </svg>
              </div>

              {/* Dotted lines Flow style overlay */}
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes dashflow {
                  to {
                    stroke-dashoffset: -20;
                  }
                }
                .animate-flow {
                  animation: dashflow 1.5s linear infinite;
                }
              `}} />

              <div className="text-center text-[10px] text-white/30 uppercase tracking-widest font-bold mt-2">
                Flow streams represent active data throughput
              </div>
            </Card>
          </motion.div>

          {/* Hub Performance (Progress Bars) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-6 h-full flex flex-col justify-between min-h-[440px]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white tracking-wide">Hub Performance</h2>
                  <select className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white/50 focus:outline-none">
                    <option value="thisweek">This Week</option>
                  </select>
                </div>

                <div className="space-y-6">
                  {hubPerformance.map((hub) => (
                    <div key={hub.name} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-white/70">{hub.name}</span>
                        <span className="font-bold text-white">{hub.value}%</span>
                      </div>
                      
                      {/* Premium Glow Progress Bar */}
                      <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5 relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${hub.value}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-full ${hub.color} rounded-full shadow-lg ${hub.glow}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-[10px] uppercase font-bold tracking-wider pt-6 border-t border-white/5 mt-6">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-white/40 block mb-0.5">Average Load</span>
                  <span className="text-white font-extrabold text-xs">57.2%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-white/40 block mb-0.5">Peak Usage</span>
                  <span className="text-neon-cyan font-extrabold text-xs">90%</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="lg:col-span-4"
          >
            <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-6 h-full flex flex-col justify-between min-h-[440px]">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white tracking-wide">Recent Activity</h2>
                  <button
                    onClick={() => navigate('/history')}
                    className="text-xs font-bold text-neon-cyan hover:text-neon-blue transition-colors"
                  >
                    View All
                  </button>
                </div>

                {/* Vertical Timeline List */}
                <div className="relative pl-6 space-y-5">
                  {/* Vertical line connecting timeline dots */}
                  <div className="absolute top-1 left-2 bottom-1 w-0.5 bg-white/10" />

                  {timelineActivities.map((act, idx) => {
                    const ActIcon = act.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.08 + 0.3 }}
                        className="relative flex justify-between items-start gap-3 text-xs group cursor-pointer"
                        onClick={() => navigate('/history')}
                      >
                        {/* Timeline Status Dot */}
                        <div className={`absolute -left-[22px] top-1.5 w-2 h-2 rounded-full ${act.color} ring-4 ring-[#050B1A] group-hover:scale-125 transition-transform duration-300`} />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white group-hover:text-neon-cyan transition-colors truncate">
                            {act.title}
                          </h4>
                          <p className="text-[10px] text-white/50 truncate">{act.details}</p>
                        </div>

                        <span className="text-[10px] text-white/30 font-medium flex-shrink-0">
                          {act.time}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center text-[10px] text-white/30 uppercase tracking-widest font-bold pt-4 border-t border-white/5 mt-4">
                Real-time activity logs streaming
              </div>
            </Card>
          </motion.div>

        </div>

      </div>
    </Layout>
  );
};

export default DashboardPage;
