import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    MessageSquare,
    LogOut,
    Menu,
    X,
    PawPrint,
    ChevronRight,
    Search,
    Bell,
    Settings,
    User as UserIcon,
    Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

const Sidebar = ({ isOpen, toggleSidebar, settings }) => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard', desc: 'Resumo geral' },
        { path: '/clientes', icon: Users, label: 'Clientes', desc: 'Sua base de pets' },
        { path: '/produtos', icon: Package, label: 'Produtos', desc: 'Gestão de ciclos' },
        { path: '/agendar-mensagem', icon: MessageSquare, label: 'Agenda', desc: 'Pós-venda' },
        { path: '/configuracoes', icon: Settings, label: 'Ajustes', desc: 'Personalização' },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleSidebar}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Header/Logo - Clickable to go home */}
                <Link to="/" className="p-8 pb-4 group cursor-pointer" onClick={() => window.innerWidth < 1024 && toggleSidebar()}>
                    <div className="flex items-center gap-3 mb-2 group-hover:scale-[1.02] transition-transform">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200/50 group-hover:shadow-amber-300/70 transition-shadow overflow-hidden">
                            {settings?.logo_url ? (
                                <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <PawPrint className="text-white drop-shadow-sm" size={28} />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-slate-900 tracking-tight">
                                {settings?.shop_name || 'PetControl'}
                            </span>
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.15em]">Pós-Venda Inteligente</span>
                        </div>
                    </div>
                </Link>

                {/* Nav Menu */}
                <nav className="flex-1 px-4 mt-8 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                            className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group relative overflow-hidden ${isActive(item.path)
                                ? 'bg-amber-50 text-amber-600 shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon size={22} className={isActive(item.path) ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-600'} />
                            <div className="flex flex-col">
                                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                <span className={`text-[10px] font-medium leading-none mt-0.5 ${isActive(item.path) ? 'text-amber-500/70' : 'text-slate-400'}`}>
                                    {item.desc}
                                </span>
                            </div>
                            {isActive(item.path) && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute right-2 w-1.5 h-6 bg-amber-500 rounded-full"
                                />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Widget Area (Improved Bottom Card) */}
                <div className="px-4 pb-6 mt-auto">
                    <div className="bg-slate-900 rounded-[32px] p-6 text-white relative overflow-hidden group">
                        {/* Decoration */}
                        <div className="absolute -right-4 -top-4 opacity-10 rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                            <PawPrint size={80} fill="currentColor" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-full border border-white/10 mb-4">
                                <Zap size={12} className="text-amber-400" />
                                <span className="text-[8px] font-black tracking-widest uppercase">Dica de Retenção</span>
                            </div>

                            <h4 className="text-sm font-black mb-3 leading-tight tracking-tight">
                                Clientes que compram <span className="text-amber-500">2x</span> no mês têm 80% mais chance de fidelizar.
                            </h4>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400">Meta Mensal</span>
                                    <span className="text-[10px] font-black text-emerald-400">75%</span>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '75%' }}
                                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mascot Overlay (Relocated) */}
                        <div className="absolute -right-2 -bottom-4 w-12 h-12 pointer-events-none animate-peek opacity-40">
                            <div className="relative w-full h-full">
                                <div className="w-10 h-8 bg-slate-600 rounded-t-full absolute bottom-0 left-0">
                                    <div className="absolute -top-2 left-1 w-3 h-3 bg-slate-600 rounded-sm rotate-[15deg]"></div>
                                    <div className="absolute -top-2 right-1 w-3 h-3 bg-slate-600 rounded-sm rotate-[-15deg]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 text-slate-400 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-4 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 group"
                    >
                        <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
                        Sair do Painel
                    </button>

                    <div className="text-center mt-4">
                        <span className="text-[8px] font-black text-slate-200 uppercase tracking-[0.3em]">PetControl v2.1</span>
                    </div>
                </div>
            </aside>
        </>
    );
};

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [appSettings, setAppSettings] = useState({ shop_name: 'PetControl', logo_url: '' });
    const { user } = useAuth();
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    React.useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await api.fetchAppSettings();
                setAppSettings(data);
            } catch (error) {
                console.error('Erro ao carregar configurações no Layout:', error);
            }
        };
        loadSettings();
    }, []);

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                settings={appSettings}
            />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Header Mobile */}
                <header className="fixed lg:hidden top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
                            <PawPrint className="text-white" size={18} />
                        </div>
                        <span className="font-black text-slate-900">PetControl</span>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="p-3 bg-slate-100 rounded-xl text-slate-600 active:scale-90 transition-transform"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                {/* Topbar Desktop */}
                <header className="hidden lg:flex h-20 bg-white/50 backdrop-blur-xl border-b border-slate-100 px-10 items-center justify-between shrink-0">
                    <div className="flex items-center bg-slate-100/80 px-4 py-2 rounded-xl border border-slate-200/50 w-72 group focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
                        <Search size={18} className="text-slate-400 group-focus-within:text-amber-500" />
                        <input type="text" placeholder="Buscar pet shop..." className="bg-transparent border-none outline-none ml-3 text-sm font-medium w-full text-slate-600" />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-3 bg-white text-slate-400 rounded-xl border border-slate-200 hover:text-amber-500 hover:border-amber-200 transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
                        </button>
                        <button className="p-3 bg-white text-slate-400 rounded-xl border border-slate-200 hover:text-slate-900 transition-all">
                            <Settings size={20} />
                        </button>

                        <div className="h-8 w-px bg-slate-100 mx-2" />

                        <div className="flex items-center gap-3 pl-2">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-black text-slate-900 tracking-tight leading-none">{user?.name || 'Veterinário'}</span>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Admin</span>
                            </div>
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-black border border-amber-200/50">
                                {user?.name?.charAt(0) || 'V'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto w-full relative pt-20 lg:pt-0 scroll-smooth">
                    {/* Background Subtle Pattern */}
                    <div className="absolute inset-0 bg-grain pointer-events-none opacity-[0.03]"></div>

                    <div className="max-w-[1400px] mx-auto p-6 md:p-10 lg:p-12 relative z-10 h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
