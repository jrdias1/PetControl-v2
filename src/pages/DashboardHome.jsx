import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    MessageSquare,
    TrendingUp,
    AlertCircle,
    Calendar,
    Clock,
    ChevronRight,
    Star,
    PawPrint,
    Zap,
    Heart,
    ShieldCheck,
    Sparkles,
    UserPlus,
    ShoppingBag,
    PackagePlus
} from 'lucide-react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { getSmartTip } from '../utils/smartTips';
import AddClientModal from '../components/AddClientModal';
import AddProductModal from '../components/AddProductModal';
import RegisterSaleModal from '../components/RegisterSaleModal';

// Helper para classes do Tailwind (não suporta interpolação dinâmica)
const getTipClasses = (color) => {
    const colorMap = {
        blue: {
            container: 'bg-blue-50 border-blue-100',
            icon: 'text-blue-500',
            label: 'text-blue-600',
            text: 'text-blue-800'
        },
        amber: {
            container: 'bg-amber-50 border-amber-100',
            icon: 'text-amber-500',
            label: 'text-amber-600',
            text: 'text-amber-800'
        },
        green: {
            container: 'bg-green-50 border-green-100',
            icon: 'text-green-500',
            label: 'text-green-600',
            text: 'text-green-800'
        },
        purple: {
            container: 'bg-purple-50 border-purple-100',
            icon: 'text-purple-500',
            label: 'text-purple-600',
            text: 'text-purple-800'
        },
        rose: {
            container: 'bg-rose-50 border-rose-100',
            icon: 'text-rose-500',
            label: 'text-rose-600',
            text: 'text-rose-800'
        }
    };
    return colorMap[color] || colorMap.amber;
};

const DashboardHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        mensagensEnviadas: 0,
        taxaRetorno: 0,
        baseMonitorada: 0,
        emRisco: 0
    });
    const [autoStatus, setAutoStatus] = useState({ total: 0, sent: 0, pending: 0, failed: 0 });
    const [topFieis, setTopFieis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dailyTip, setDailyTip] = useState(null);
    const [shopName, setShopName] = useState('PetControl');
    const [isAddClientOpen, setIsAddClientOpen] = useState(false);
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

    const loadDashboardData = useCallback(async () => {
        try {
            const [clients, agenda, sales, status, settings] = await Promise.all([
                api.fetchClients(),
                api.fetchAgenda(),
                api.fetchSales(),
                api.getAutomationStatus(),
                api.fetchAppSettings()
            ]);

            if (settings?.shop_name) {
                setShopName(settings.shop_name);
            }

            setAutoStatus(status);

            // 1. Base Monitorada: Total de clientes
            const baseMonitorada = clients.length;

            // 2. Mensagens Enviadas: Itens na agenda com data passada ou hoje
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const mensagensEnviadas = agenda.filter(item => new Date(item.scheduled_date) <= hoje).length;

            // 3. Em Risco: Clientes que não compram há mais de 60 dias (exemplo)
            const sessentaDiasAtras = new Date();
            sessentaDiasAtras.setDate(sessentaDiasAtras.getDate() - 60);

            // Pegar última venda de cada cliente
            const ultimasVendas = {};
            sales.forEach(sale => {
                if (!ultimasVendas[sale.client_id] || new Date(sale.sale_date) > new Date(ultimasVendas[sale.client_id])) {
                    ultimasVendas[sale.client_id] = sale.sale_date;
                }
            });

            const emRisco = Object.values(ultimasVendas).filter(data => new Date(data) < sessentaDiasAtras).length;

            // 4. Taxa de Retorno: (Clientes com > 1 venda / Total Clientes) * 100
            const comprasPorCliente = {};
            sales.forEach(sale => {
                comprasPorCliente[sale.client_id] = (comprasPorCliente[sale.client_id] || 0) + 1;
            });
            const clientesFieis = Object.values(comprasPorCliente).filter(count => count > 1).length;
            const taxaRetorno = baseMonitorada > 0 ? Math.round((clientesFieis / baseMonitorada) * 100) : 0;

            const currentStats = {
                mensagensEnviadas,
                taxaRetorno,
                baseMonitorada,
                emRisco
            };

            setStats(currentStats);
            setDailyTip(getSmartTip(currentStats));

            // Top Fiéis
            const fieisData = Object.entries(comprasPorCliente)
                .map(([id, count]) => {
                    const cliente = clients.find(c => c.id === id);
                    return {
                        id,
                        name: cliente?.full_name || 'Cliente',
                        pet: cliente?.pet_name || 'Pet',
                        buys: count
                    };
                })
                .sort((a, b) => b.buys - a.buys)
                .slice(0, 5);

            setTopFieis(fieisData);
        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 1, y: 0 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    const statCards = [
        {
            label: 'Mensagens Enviadas',
            value: stats.mensagensEnviadas,
            icon: MessageSquare,
            color: 'amber',
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            trend: 'Automático',
            desc: 'Lembretes disparados'
        },
        {
            label: 'Taxa de Retorno',
            value: `${stats.taxaRetorno}%`,
            icon: TrendingUp,
            color: 'emerald',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            trend: '+12%',
            desc: 'Clientes que voltaram'
        },
        {
            label: 'Base Monitorada',
            value: stats.baseMonitorada,
            icon: Users,
            color: 'indigo',
            bg: 'bg-indigo-50',
            text: 'text-indigo-600',
            trend: 'Em crescimento',
            desc: 'Total de clientes'
        },
        {
            label: 'Clientes em Risco',
            value: stats.emRisco,
            icon: AlertCircle,
            color: 'rose',
            bg: 'bg-rose-50',
            text: 'text-rose-600',
            trend: 'Atenção',
            desc: 'Sem compras há 60 dias'
        },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="w-16 h-16 bg-amber-100 rounded-[32px] p-4 animate-bounce mb-4 flex items-center justify-center">
                    <PawPrint className="text-amber-500" size={32} />
                </div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Preparando seu painel...</p>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
        >
            {/* Boas-vindas e Ações Rápidas */}
            <motion.div variants={cardVariants} className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div className="flex-1">
                    <div className="flex items-center gap-3 text-amber-500 font-black uppercase tracking-[0.3em] text-[10px] mb-3">
                        <Zap size={14} fill="currentColor" />
                        Visão Geral de Hoje
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tighter">
                        Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">{shopName}</span> 👋
                    </h1>

                    {/* Dica Diária Dinâmica */}
                    {dailyTip && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className={`mt-4 p-4 rounded-2xl border flex items-start gap-4 max-w-xl ${getTipClasses(dailyTip.color).container}`}
                        >
                            <div className={`p-2 bg-white rounded-lg shadow-sm ${getTipClasses(dailyTip.color).icon}`}>
                                <Sparkles size={18} fill="currentColor" className="animate-pulse" />
                            </div>
                            <div>
                                <span className={`text-[10px] font-black uppercase tracking-wider mb-1 block ${getTipClasses(dailyTip.color).label}`}>
                                    Dica de Retenção
                                </span>
                                <p className={`text-sm font-bold leading-snug ${getTipClasses(dailyTip.color).text}`}>
                                    "{dailyTip.text}"
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsAddClientOpen(true)}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl font-black transition-all shadow-lg shadow-amber-200 active:scale-95 group flex-1 sm:flex-none justify-center"
                    >
                        <UserPlus size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        <span className="leading-none text-sm">Cliente</span>
                    </button>
                    <button
                        onClick={() => setIsSaleModalOpen(true)}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl font-black transition-all shadow-lg shadow-emerald-200 active:scale-95 group flex-1 sm:flex-none justify-center"
                    >
                        <ShoppingBag size={18} className="group-hover:rotate-12 transition-transform" />
                        <span className="leading-none text-sm">Venda</span>
                    </button>
                    <button
                        onClick={() => setIsAddProductOpen(true)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black transition-all shadow-lg shadow-indigo-200 active:scale-95 group flex-1 sm:flex-none justify-center"
                    >
                        <PackagePlus size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                        <span className="leading-none text-sm">Produto</span>
                    </button>
                </div>
            </motion.div>

            {/* Automation Status Card */}
            <motion.div
                variants={cardVariants}
                className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20"
            >
                <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
                    <Zap size={200} fill="currentColor" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Zap size={32} fill="white" className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">Status da Automação (Hoje)</h3>
                            <p className="text-slate-400 font-medium text-sm">Monitoramento em tempo real do disparo das 08h</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</div>
                            <div className="text-xl font-black">{autoStatus.total}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Enviadas</div>
                            <div className="text-xl font-black text-emerald-400">{autoStatus.sent}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                            <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Pendente</div>
                            <div className="text-xl font-black text-amber-400">{autoStatus.pending}</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                            <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Falhas</div>
                            <div className="text-xl font-black text-rose-400">{autoStatus.failed}</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Grid de Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" >
                {
                    statCards.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            variants={cardVariants}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/40 border border-slate-100 group transition-all"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 ${stat.bg} ${stat.text} rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-colors`}>
                                    <stat.icon size={28} />
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1 ${stat.bg} ${stat.text} rounded-full uppercase tracking-widest`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1 leading-none">{stat.label}</h3>
                            <div className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">{stat.value}</div>
                            <p className="text-slate-400 text-xs font-medium leading-none">{stat.desc}</p>
                        </motion.div>
                    ))
                }
            </div >

            {/* Conteúdo Secundário */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" >
                {/* Ranking de Fidelidade - Expandido para 3 colunas */}
                <motion.div variants={cardVariants} className="lg:col-span-3 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden" >
                    <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white relative">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-[22px] flex items-center justify-center shadow-inner">
                                <Star size={28} fill="currentColor" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Top Fiéis do Mês</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Sua base de clientes mais apaixonada</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Base Ativa</span>
                            </div>
                            <button onClick={() => navigate('/clientes')} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-amber-500 hover:text-white transition-all active:scale-90 group">
                                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="p-2 sm:p-6 lg:p-10">
                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-y-4">
                                <thead>
                                    <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                        <th className="px-8 py-2">Cliente / Pet</th>
                                        <th className="px-8 py-2 text-center">Frequência</th>
                                        <th className="px-8 py-2 text-right">Amor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topFieis.length > 0 ? topFieis.map((item, idx) => (
                                        <tr key={idx} className="group transition-all">
                                            <td className="px-8 py-5 bg-slate-50 group-hover:bg-amber-50/50 rounded-l-[32px] border-y border-l border-transparent group-hover:border-amber-100/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 font-black text-lg shadow-sm border border-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-all">
                                                        {item.name.substring(0, 1)}
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-900 text-base font-black tracking-tight leading-none mb-1.5">{item.name}</div>
                                                        <div className="text-slate-400 text-xs font-bold flex items-center gap-1.5 leading-none">
                                                            <span className="text-amber-500/70 italic font-medium">Pet:</span>
                                                            <span className="font-black text-slate-600">{item.pet}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 bg-slate-50 group-hover:bg-amber-50/50 border-y border-transparent group-hover:border-amber-100/50 text-center transition-colors">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-lg font-black text-slate-900">{item.buys}</span>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sessões</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 bg-slate-50 group-hover:bg-amber-50/50 rounded-r-[32px] border-y border-r border-transparent group-hover:border-amber-100/50 text-right transition-colors">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {[...Array(Math.min(item.buys, 5))].map((_, i) => (
                                                        <Heart
                                                            key={i}
                                                            size={14}
                                                            fill="#f43f5e"
                                                            className="text-rose-500/20 group-hover:animate-bounce"
                                                            style={{ animationDelay: `${i * 0.15}s` }}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs italic bg-slate-50/50 rounded-[32px]">
                                                Buscando os clientes mais fiéis... 🐾
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div >
            </div >

            <AddClientModal
                isOpen={isAddClientOpen}
                onClose={() => setIsAddClientOpen(false)}
                onSuccess={loadDashboardData}
            />

            <AddProductModal
                isOpen={isAddProductOpen}
                onClose={() => setIsAddProductOpen(false)}
                onSuccess={loadDashboardData}
            />

            <RegisterSaleModal
                isOpen={isSaleModalOpen}
                onClose={() => setIsSaleModalOpen(false)}
                onSuccess={loadDashboardData}
                client={null}
            />
        </motion.div >
    );
};

export default DashboardHome;
