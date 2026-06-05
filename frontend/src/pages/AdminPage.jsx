import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { API_ENDPOINTS } from '../config/api.js';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import {
  Users,
  Activity,
  Heart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  Lock,
  ArrowRight,
  X,
  ChevronRight,
  Server,
  Database,
  Cpu,
  Layers,
  Zap,
  Clock,
  Shield,
  FileText,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { Input } from '../components/Input.jsx';
import { Button } from '../components/Button.jsx';
import { Disclaimer } from '../components/Disclaimer.jsx';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto Refresh State
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Admin Session State
  const [adminToken, setAdminToken] = useState(sessionStorage.getItem('admin_token'));
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Drill-down Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalType, setModalType] = useState(null); // 'users' or 'queries'

  useEffect(() => {
    if (!authLoading && user && adminToken) {
      fetchAdminData();
    }
  }, [user, authLoading, adminToken]);

  // Handle auto-refresh interval
  useEffect(() => {
    if (!adminToken || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchAdminData();
    }, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [adminToken, autoRefresh]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);
    try {
      const res = await api.post(API_ENDPOINTS.admin.verify, { password });
      const token = res.data.admin_token;
      sessionStorage.setItem('admin_token', token);
      setAdminToken(token);
    } catch (err) {
      setError("Invalid admin password. Access denied.");
      setAdminToken(null);
      sessionStorage.removeItem('admin_token');
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const config = { headers: { 'Admin-Access-Token': adminToken } };

      const [kpiRes, perfRes, heatRes] = await Promise.all([
        api.get(API_ENDPOINTS.admin.kpis, config),
        api.get(API_ENDPOINTS.admin.performance, config),
        api.get(API_ENDPOINTS.admin.heatmap, config)
      ]);

      setStats(kpiRes.data);
      setPerformance(perfRes.data.models);
      setHeatmap(heatRes.data.heatmap);
    } catch (err) {
      console.error("Admin Data Error:", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        setAdminToken(null);
        sessionStorage.removeItem('admin_token');
      } else {
        setError(err.response?.data?.error || "Failed to load admin analytics");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async () => {
    setModalOpen(true);
    setModalTitle("Registered Users");
    setModalType('users');
    setModalLoading(true);
    try {
      const config = { headers: { 'Admin-Access-Token': adminToken } };
      const res = await api.get(API_ENDPOINTS.admin.users, config);
      setModalData(res.data);
    } catch (err) {
      console.error("Fetch Users Error", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleQueryClick = async () => {
    setModalOpen(true);
    setModalTitle("Query Distribution");
    setModalType('queries');
    setModalLoading(true);
    try {
      const config = { headers: { 'Admin-Access-Token': adminToken } };
      const res = await api.get(API_ENDPOINTS.admin.queries, config);
      setModalData(res.data); // Expect [{domain, count}]
    } catch (err) {
      console.error("Fetch Queries Error", err);
    } finally {
      setModalLoading(false);
    }
  };

  if (authLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  // Render Password Gate if no token
  if (!adminToken) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20 animate-fade-in">
          <Card className="p-8 border-red-500/20 bg-navy-light/40 backdrop-blur-xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30 shadow-lg shadow-red-500/10">
                <Lock className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
                Admin Console
              </h1>
              <p className="text-white/60 mt-2 font-medium">Enter admin credentials to access system control</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <Input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                autoFocus
              />

              {error && (
                <div className="text-red-400 text-sm flex items-center gap-2 bg-red-500/10 p-4 rounded-xl border border-red-500/25">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isVerifying || !password}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
              >
                {isVerifying ? <LoadingSpinner size="sm" /> : (
                  <span className="flex items-center gap-2 justify-center">
                    Access Console <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </Card>
        </div>
        <Disclaimer type="footer" />
      </Layout>
    );
  }

  // Dashboard Aggregates with design values as defaults
  const totalUsersCount = stats?.users?.total ?? 10;
  const totalQueriesCount = stats?.queries?.total ?? 99;

  const kpis = [
    {
      title: 'Total Users',
      value: totalUsersCount,
      sub: `${stats?.users?.active_24h || 2} new in 24h`,
      trend: '↑ 12% from yesterday',
      isUp: true,
      color: 'from-blue-500 to-cyan-500',
      icon: Users,
      iconColor: 'text-blue-400',
      onClick: handleUserClick
    },
    {
      title: 'Total Queries',
      value: totalQueriesCount,
      sub: `Avg ${stats?.queries?.avg_per_user || 9.9} per user`,
      trend: '↑ 15% from yesterday',
      isUp: true,
      color: 'from-purple-500 to-indigo-500',
      icon: Activity,
      iconColor: 'text-purple-400',
      onClick: handleQueryClick
    },
    {
      title: 'AI Success Rate',
      value: '92%',
      sub: 'Error-free runs',
      trend: '↑ 5.6% from yesterday',
      isUp: true,
      color: 'from-green-500 to-emerald-500',
      icon: ShieldAlert,
      iconColor: 'text-green-400'
    },
    {
      title: 'Average Response Time',
      value: '0.56s',
      sub: 'Compute response delay',
      trend: '↓ 8% from yesterday',
      isUp: true, // down in response time is good
      color: 'from-yellow-500 to-amber-500',
      icon: Clock,
      iconColor: 'text-yellow-400'
    },
    {
      title: 'Active Sessions',
      value: 4,
      sub: 'Live connections',
      trend: 'Currently Online',
      isUp: true,
      color: 'from-cyan-500 to-blue-500',
      icon: Server,
      iconColor: 'text-cyan-400'
    }
  ];

  // API Performance Line Chart Data
  const apiPerfData = [
    { name: 'Mon', time: 0.6 },
    { name: 'Tue', time: 0.7 },
    { name: 'Wed', time: 0.5 },
    { name: 'Thu', time: 0.8 },
    { name: 'Fri', time: 0.4 },
    { name: 'Sat', time: 0.6 },
    { name: 'Sun', time: 0.5 }
  ];

  // Platform Distribution Donut Chart Data
  const platformData = [
    { name: 'Medical AI', value: 43, color: '#EF4444' },
    { name: 'Agriculture AI', value: 33, color: '#10B981' },
    { name: 'Student AI', value: 24, color: '#3B82F6' },
    { name: 'Finance AI', value: 0, color: '#F59E0B' }
  ];

  // AI Model Status Cards Grid Data
  const modelStatusData = [
    { name: 'Lung Detection', accuracy: 91, latency: '0.5s', requests: 21, lastUsed: '3 mins ago' },
    { name: 'Brain Tumor', accuracy: 93, latency: '0.6s', requests: 18, lastUsed: '5 mins ago' },
    { name: 'Skin Disease', accuracy: 89, latency: '0.4s', requests: 16, lastUsed: '4 mins ago' },
    { name: 'Crop Analysis', accuracy: 88, latency: '0.7s', requests: 18, lastUsed: '2 mins ago' },
    { name: 'Crop Recommendation', accuracy: 90, latency: '0.6s', requests: 14, lastUsed: '3 mins ago' },
    { name: 'EduMentor', accuracy: 92, latency: '0.5s', requests: 12, lastUsed: '3 mins ago' }
  ];

  // Live Requests
  const liveRequests = [
    { user: 'Manasa', path: 'Medical AI → Lung Detection', status: 'Processing', time: '1.2s', relativeTime: 'Just now', dotColor: 'bg-yellow-400 animate-pulse' },
    { user: 'Rohit', path: 'Agriculture AI → Crop Analysis', status: 'Completed', time: '0.8s', relativeTime: '1 min ago', dotColor: 'bg-green-500' },
    { user: 'Sneha', path: 'Student AI → Career Path', status: 'Completed', time: '1.1s', relativeTime: '2 mins ago', dotColor: 'bg-green-500' },
    { user: 'Arjun', path: 'Finance AI → Expense Report', status: 'Failed', time: '2.3s', relativeTime: '5 mins ago', dotColor: 'bg-red-500' },
    { user: 'Kavya', path: 'Medical AI → Skin Disease', status: 'Completed', time: '0.6s', relativeTime: '6 mins ago', dotColor: 'bg-green-500' }
  ];

  // Audit Logs Event Data
  const auditLogs = [
    { time: '12:05 PM', event: 'Admin Login', desc: 'manasa@gmail.com', user: 'manasa', ip: '192.168.1.1' },
    { time: '12:10 PM', event: 'Medical Model Updated', desc: 'Lung Detection Model v2.1 deployed', user: 'system_agent', ip: '127.0.0.1' },
    { time: '12:22 PM', event: 'New User Registered', desc: 'user_12345@gmail.com', user: 'auth_service', ip: '192.168.1.5' },
    { time: '12:35 PM', event: 'Agriculture Analysis Completed', desc: 'Tomato crop disease analysis', user: 'rohit_farm', ip: '192.168.1.20' },
    { time: '12:45 PM', event: 'System Backup Completed', desc: 'All system data backed up', user: 'cron_agent', ip: '127.0.0.1' }
  ];

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto space-y-8 pb-12">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold mb-2 text-white flex items-center gap-3">
              <ShieldAlert className="w-10 h-10 text-red-500" />
              Admin Console
            </h1>
            <p className="text-white/60 font-medium">System Monitoring & AI Operations Intelligence</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center gap-4 bg-navy-light/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Session Status:</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                Active
              </span>
            </div>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Auto Refresh:</span>
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${autoRefresh ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30' : 'bg-white/5 text-white/40 border border-white/5'}`}
              >
                {autoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Uptime:</span>
              <span className="text-xs text-white font-extrabold">99.98%</span>
            </div>

            <div className="h-4 w-px bg-white/10" />

            <button
              onClick={() => {
                sessionStorage.removeItem('admin_token');
                setAdminToken(null);
              }}
              className="text-xs font-bold px-3.5 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-all active:scale-95"
            >
              Lock Console
            </button>
          </motion.div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* 5 Premium KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                onClick={kpi.onClick}
                className={kpi.onClick ? 'cursor-pointer' : ''}
              >
                <Card
                  hover
                  className="relative overflow-hidden group border border-white/5 bg-navy-light/20 backdrop-blur-xl h-full p-6 transition-all hover:-translate-y-1 hover:border-white/10"
                >
                  <div className={`absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-gradient-to-br ${kpi.color} opacity-[0.03] blur-xl group-hover:scale-150 transition-all duration-500`} />

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-white/50 tracking-wide uppercase">{kpi.title}</span>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-3xl font-extrabold text-white tracking-tight">{kpi.value}</h3>
                    <p className={`text-xs font-bold flex items-center gap-1 ${kpi.isUp ? 'text-green-400' : 'text-white/40'}`}>
                      {kpi.trend}
                    </p>
                  </div>
                  <p className="text-[10px] text-white/30 border-t border-white/5 pt-2 mt-2 font-medium">{kpi.sub}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Row 2: System Health, API Performance, Platform Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* System Health Overview (Left Column) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-4"
          >
            <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-6 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-6 text-white tracking-wide">System Health Overview</h2>

                <div className="flex items-center justify-between gap-6">
                  {/* Services status list */}
                  <div className="flex-1 space-y-3 text-xs">
                    {[
                      'Backend API',
                      'MongoDB',
                      'Gemini API',
                      'Roboflow Models',
                      'Authentication',
                      'Storage Service'
                    ].map((svc) => (
                      <div key={svc} className="flex items-center justify-between font-semibold">
                        <span className="text-white/60">{svc}</span>
                        <span className="flex items-center gap-1.5 text-green-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                          Healthy
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Health score gauge chart */}
                  <div className="w-32 h-32 flex-shrink-0 relative flex items-center justify-center">
                    {/* SVG Circular health chart */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                      <circle cx="50" cy="50" r="40" stroke="#10B981" strokeWidth="6" fill="transparent" strokeDasharray="251" strokeDashoffset={251 * (1 - 0.96)} strokeLinecap="round" className="shadow-lg shadow-emerald-500/30" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-white">96%</span>
                      <span className="text-[9px] uppercase text-white/40 tracking-widest font-bold">Health Score</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-xs">
                <span className="text-white/40 font-semibold">System Operational Status</span>
                <span className="text-green-400 font-extrabold">Excellent</span>
              </div>
            </Card>
          </motion.div>

          {/* API Performance (Avg Response Time) Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="lg:col-span-4"
          >
            <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white tracking-wide">API Performance</h2>
                  <span className="text-xs bg-white/5 border border-white/10 text-white/50 px-2.5 py-1 rounded-xl font-semibold">
                    Last 7 Days
                  </span>
                </div>

                <div className="w-full h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={apiPerfData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="adminLineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#00F0FF" />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#ffffff" opacity={0.3} fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff" opacity={0.3} fontSize={9} tickLine={false} axisLine={false} domain={[0.3, 1.0]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(5, 11, 26, 0.95)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                        }}
                        itemStyle={{ color: '#00F0FF', fontWeight: 'bold' }}
                        labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="time"
                        stroke="url(#adminLineGrad)"
                        strokeWidth={3}
                        dot={{ fill: '#050B1A', stroke: '#00F0FF', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-white/40 font-medium border-t border-white/5 pt-4 mt-4">
                <span>Metric: Average Response Time</span>
                <span className="text-white font-bold">Latency Target: 0.5s</span>
              </div>
            </Card>
          </motion.div>

          {/* Platform Distribution Donut Chart */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="lg:col-span-4"
          >
            <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-6 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-6 text-white tracking-wide">Platform Distribution</h2>

                <div className="flex items-center justify-between gap-2">
                  {/* Donut PieChart */}
                  <div className="w-36 h-36 relative flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformData}
                          innerRadius={50}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-extrabold text-white">99</span>
                      <span className="text-[8px] uppercase text-white/40 tracking-widest font-bold leading-tight">Total Queries</span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="flex-1 space-y-2 pl-4 text-xs font-semibold">
                    {platformData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-white/70 truncate">{item.name}</span>
                        </div>
                        <span className="text-white font-bold">{item.value}% ({item.name.includes('Medical') ? 43 : item.name.includes('Agri') ? 33 : item.name.includes('Stud') ? 24 : 0})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6 text-center text-[10px] text-white/30 uppercase tracking-widest font-bold">
                Live distribution of queries across AI hubs
              </div>
            </Card>
          </motion.div>

        </div>

        {/* Row 3: AI Model Status, Live Requests, Security & API Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* AI Model Status Center (Grid of model cards) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-6 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold mb-4 text-white tracking-wide">AI Model Status</h2>
                
                {/* 6 Models Subgrid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {modelStatusData.map((model) => (
                    <div
                      key={model.name}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-white text-[11px] leading-tight truncate mr-1" title={model.name}>
                          {model.name}
                        </span>
                        <span className="flex h-2 w-2 relative flex-shrink-0 mt-0.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[10px] text-white/50">
                        <div className="flex justify-between font-semibold">
                          <span>Accuracy</span>
                          <span className="text-white font-extrabold">{model.accuracy}%</span>
                        </div>
                        {/* Progress Accuracy bar */}
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${model.accuracy}%` }} />
                        </div>
                        
                        <div className="flex justify-between pt-1 font-semibold">
                          <span>Latency</span>
                          <span className="text-white font-extrabold">{model.latency}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Requests</span>
                          <span className="text-white font-extrabold">{model.requests}</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-white/30 border-t border-white/5 pt-1 mt-1">
                          <span>Last Used</span>
                          <span className="font-semibold text-white/40">{model.lastUsed}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6">
                <button 
                  onClick={() => navigate('/history')}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-neon-cyan hover:text-neon-blue transition-colors group"
                >
                  View all models
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Live Request Monitor */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="lg:col-span-4"
          >
            <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white tracking-wide">Live Requests</h2>
                  <button 
                    onClick={() => navigate('/history')}
                    className="text-xs font-bold text-neon-cyan hover:text-neon-blue transition-colors"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {liveRequests.map((req, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-white/10 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Fake Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center text-[10px] text-white/80 font-bold flex-shrink-0">
                          {req.user.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white leading-tight truncate">{req.user}</h4>
                          <p className="text-[10px] text-white/40 truncate">{req.path}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          req.status === 'Processing' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' :
                          req.status === 'Failed' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                          'bg-green-500/15 text-green-400 border border-green-500/20'
                        }`}>
                          {req.status}
                        </span>
                        <div className="flex items-center gap-1.5 text-[9px] text-white/30 font-medium">
                          <span>{req.time}</span>
                          <span className="w-1 h-1 rounded-full bg-white/30" />
                          <span>{req.relativeTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6">
                <button 
                  onClick={() => navigate('/history')}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-neon-cyan hover:text-neon-blue transition-colors group"
                >
                  View all live requests
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Security Center & Cost Panels */}
          <div className="lg:col-span-3 flex flex-col gap-6 justify-between">
            {/* Security Command Center */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34 }}
              className="flex-1"
            >
              <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-5 h-full relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase text-white/50 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    Security Center
                  </h3>

                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-2 text-xs font-semibold flex-1">
                      <div className="flex justify-between">
                        <span className="text-white/60">Failed Logins (24h)</span>
                        <span className="text-white font-extrabold">2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Active Sessions</span>
                        <span className="text-white font-extrabold">4</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Blocked Requests</span>
                        <span className="text-white font-extrabold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">JWT Status</span>
                        <span className="text-green-400 font-extrabold">Healthy</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5">
                        <span className="text-white/40">Threat Level</span>
                        <span className="text-green-400 font-extrabold uppercase tracking-wide">Low</span>
                      </div>
                    </div>

                    {/* Shield Illustration Graphic */}
                    <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-xl animate-pulse" />
                      <svg className="w-12 h-12 text-cyan-400 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* AI Usage & Cost Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex-1"
            >
              <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-5 h-full relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase text-white/50 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    AI Usage & Cost (Today)
                  </h3>

                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-2 text-xs font-semibold flex-1">
                      <div className="flex justify-between">
                        <span className="text-white/60">Gemini API Calls</span>
                        <span className="text-white font-extrabold">231</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Roboflow API Calls</span>
                        <span className="text-white font-extrabold">118</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5">
                        <span className="text-white/40">Total API Calls</span>
                        <span className="text-white font-extrabold">349</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Estimated Cost</span>
                        <span className="text-green-400 font-extrabold text-sm">$3.41</span>
                      </div>
                    </div>

                    {/* Servers/Coins Visual */}
                    <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-green-500/10 rounded-full blur-xl animate-pulse" />
                      <svg className="w-12 h-12 text-green-400 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="2" width="20" height="8" rx="2" />
                        <rect x="2" y="14" width="20" height="8" rx="2" />
                        <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="3" />
                        <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

        </div>

        {/* Row 4: Audit Logs, System Forecast, AI Control Center */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Audit Logs Event Table (Left, width 8 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-8"
          >
            <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Audit Logs
                  </h2>
                  <div className="flex items-center gap-3">
                    <button className="text-xs bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white px-3 py-1.5 rounded-xl font-bold transition-all">
                      Export Logs
                    </button>
                    <button 
                      onClick={() => navigate('/history')}
                      className="text-xs font-bold text-neon-cyan hover:text-neon-blue transition-colors"
                    >
                      View All
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider font-bold">
                        <th className="pb-3 pl-2">Time</th>
                        <th className="pb-3 pl-2">Event</th>
                        <th className="pb-3 pl-2">Description</th>
                        <th className="pb-3 pl-2">User</th>
                        <th className="pb-3 pr-2 text-right">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold">
                      {auditLogs.map((log, index) => (
                        <tr key={index} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 pl-2 text-white/40 font-medium whitespace-nowrap">{log.time}</td>
                          <td className="py-3.5 pl-2 text-white font-bold">{log.event}</td>
                          <td className="py-3.5 pl-2 text-white/60 font-medium truncate max-w-[200px]" title={log.desc}>{log.desc}</td>
                          <td className="py-3.5 pl-2 text-white/50">{log.user}</td>
                          <td className="py-3.5 pr-2 text-right font-mono text-white/40">{log.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* System Forecast & Control Center Column (Right, width 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* System Forecast Panel */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38 }}
            >
              <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase text-white/50 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      System Forecast
                    </h3>
                    <button className="text-[10px] font-bold text-neon-cyan hover:text-neon-blue transition-colors">
                      View Details
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-white/60">Predicted Queries Tomorrow</span>
                      <span className="text-white font-extrabold flex items-center gap-1.5">
                        132
                        <span className="text-green-400 text-[10px] font-bold flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />
                          18%
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Expected Peak Time</span>
                      <span className="text-white font-extrabold">6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Expected CPU Usage</span>
                      <span className="text-white font-extrabold">58%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Expected API Load</span>
                      <span className="text-yellow-400 font-extrabold">Medium</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                      <span className="text-white/40">Expected AI Confidence</span>
                      <span className="text-white font-extrabold flex items-center gap-1.5">
                        89.2%
                        <span className="text-green-400 text-[10px] font-bold flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />
                          3%
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* AI Control Center Action Panel */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.44 }}
            >
              <Card className="border border-white/5 bg-navy-light/20 backdrop-blur-xl p-5 h-full">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase text-white/50 mb-4 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-neon-cyan" />
                  AI Control Center
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Restart Models', action: () => alert('Models restarting...') },
                    { label: 'Run Diagnostics', action: () => alert('Diagnostics triggered...') },
                    { label: 'Refresh Analytics', action: () => fetchAdminData() },
                    { label: 'Export Reports', action: () => alert('Exporting data reports...') },
                    { label: 'View Logs', action: () => navigate('/history') },
                    { label: 'Manage Users', action: () => handleUserClick() }
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      onClick={btn.action}
                      className="py-2.5 px-3 bg-white/5 hover:bg-neon-cyan/10 border border-white/5 hover:border-neon-cyan/30 text-white/80 hover:text-neon-cyan rounded-xl text-center text-xs font-bold transition-all active:scale-[0.98] shadow-sm hover:shadow-neon-cyan/10"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

          </div>

        </div>

      </div>

      {/* Drill-down Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setModalOpen(false)}>
          <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col p-0 border border-white/10 bg-navy-light/80 backdrop-blur-xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-lg font-bold text-white">{modalTitle}</h3>
              <button onClick={() => setModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto min-h-[200px]">
              {modalLoading ? (
                <div className="flex justify-center items-center h-40">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-2">
                  {modalType === 'users' && modalData?.map((u, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div>
                        <p className="font-semibold text-white text-sm">{u.name || u.username}</p>
                        <p className="text-xs text-white/50">{u.email}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold border border-white/5 text-white/80">
                        {((u.name || u.username)?.[0] || 'U').toUpperCase()}
                      </div>
                    </div>
                  ))}

                  {modalType === 'queries' && modalData?.map((q, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5">
                      <span className="font-semibold text-white text-sm capitalize">{q.domain}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            style={{ width: `${Math.min((q.count / 50) * 100, 100)}%` }} // Rough relative scale
                          />
                        </div>
                        <span className="text-xs font-mono text-neon-cyan min-w-[30px] text-right font-extrabold">{q.count}</span>
                      </div>
                    </div>
                  ))}

                  {(!modalData || modalData.length === 0) && (
                    <p className="text-center text-white/40 py-8 font-semibold">No data available.</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <Disclaimer type="footer" />
    </Layout>
  );
};

export default AdminPage;
