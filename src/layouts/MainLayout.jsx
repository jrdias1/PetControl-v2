import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquareMore, Settings, LogOut, Package, Menu } from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('petcontrol_auth');
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Visão Geral', path: '/' },
        { icon: Users, label: 'Clientes & Retenção', path: '/clientes' },
        { icon: Package, label: 'Produtos', path: '/produtos' },
        { icon: MessageSquareMore, label: 'Agenda', path: '/agendar-mensagem' },
    ];

    return (
        <div className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 shadow-sm z-10">
            {/* Logo Area */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    P
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                        PetControl
                    </h1>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Gestão Simples</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-purple-50 text-purple-700 font-medium shadow-sm ring-1 ring-purple-100'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                <span className="text-sm">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User / Logout */}
            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Sair do Sistema</span>
                </button>
            </div>
        </div>
    );
};

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
