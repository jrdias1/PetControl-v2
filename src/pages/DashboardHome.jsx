import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, AlertCircle, Calendar, MessageCircle, CheckCircle2, UserPlus, PackagePlus, ShoppingCart } from 'lucide-react';
import AddClientModal from '../components/AddClientModal';
import AddProductModal from '../components/AddProductModal';
import AddSaleModal from '../components/AddSaleModal';

const StatCard = ({ title, value, subtext, icon: Icon, color, bg }) => (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100/80 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300 group cursor-default">
        <div className="flex justify-between items-start">
            <div className="space-y-1">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
                </div>
                <p className={`text-[11px] font-semibold flex items-center gap-1 ${color}`}>
                    <TrendingUp size={12} />
                    {subtext}
                </p>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} />
            </div>
        </div>
    </div>
);

const DashboardHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        sent: 0,
        returnRate: 0,
        base: 0,
        atRisk: 0,
        topClients: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        calculateStats();
    }, []);

    const calculateStats = async () => {
        try {
            setLoading(true);
            // 1. Busca dados das duas planilhas
            const [salesRes, agendaRes] = await Promise.all([
                fetch('https://vmi3061755.contaboserver.net/webhook/pet-control/clientes'),
                fetch('https://vmi3061755.contaboserver.net/webhook/pet-control/listar-agenda')
            ]);

            const sales = await salesRes.json();
            const agenda = await agendaRes.json();

            // 2. Processa Vendas (cadastro)
            const sentCount = Array.isArray(sales) ? sales.filter(s => String(s.enviado).toUpperCase() === 'SIM').length : 0;

            // Agrupa por telefone para contar clientes únicos e fidelidade
            const clientsMap = {};
            if (Array.isArray(sales)) {
                sales.forEach(s => {
                    const phone = String(s.telefone || s.Telefone || '').replace(/\D/g, '');
                    if (!phone) return;
                    if (!clientsMap[phone]) {
                        clientsMap[phone] = {
                            nome: s.nome || s.Nome || 'Cliente',
                            count: 0
                        };
                    }
                    clientsMap[phone].count++;
                });
            }

            const uniqueClients = Object.keys(clientsMap).length;

            // Top Fiéis
            const top5 = Object.values(clientsMap)
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((c, i) => ({
                    rank: i + 1,
                    nome: c.nome,
                    compras: c.count
                }));

            // 3. Processa Agenda
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let atRiskCount = 0;
            if (Array.isArray(agenda)) {
                atRiskCount = agenda.filter(item => {
                    const status = String(item.Status || item.status || '').toUpperCase();
                    const dateStr = item['Data de Envio'] || item.data_envio;
                    if (!dateStr || status !== 'PENDENTE') return false;

                    const [d, m, y] = dateStr.split('/');
                    const itemDate = new Date(y, m - 1, d);
                    return itemDate < today; // Já passou da data e continua pendente
                }).length;
            }

            setStats({
                sent: sentCount,
                returnRate: uniqueClients > 0 ? Math.round((sentCount / uniqueClients) * 5) : 0, // Estimativa simples
                base: uniqueClients,
                atRisk: atRiskCount,
                topClients: top5
            });
        } catch (error) {
            console.error('Erro ao calcular estatísticas:', error);
        } finally {
            setLoading(false);
        }
    };
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Painel de Pós-Venda</h2>
                    <p className="text-slate-500 mt-1">
                        Foco total na <span className="text-purple-600 font-semibold">Fidelização</span>. Veja quem precisa de atenção hoje.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Setup Actions Group */}
                    <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/60 backdrop-blur-sm">
                        <button
                            onClick={() => setIsClientModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-white transition-all font-semibold text-xs"
                        >
                            <UserPlus size={16} />
                            Novo Cliente
                        </button>
                        <button
                            onClick={() => setIsProductModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-all font-semibold text-xs"
                        >
                            <PackagePlus size={16} />
                            Novo Produto
                        </button>
                    </div>

                    {/* Primary Actions Group */}
                    <button
                        onClick={() => navigate('/agendar-mensagem')}
                        className="flex items-center gap-2 bg-white border border-emerald-100 text-emerald-700 px-5 py-2.5 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md hover:bg-emerald-50 text-sm"
                    >
                        <MessageCircle size={18} className="text-emerald-500" />
                        Agendar Mensagem
                    </button>

                    <button
                        onClick={() => setIsSaleModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-xl shadow-slate-200 hover:bg-black hover:-translate-y-0.5 active:translate-y-0 text-sm"
                    >
                        <ShoppingCart size={18} className="text-blue-400" />
                        Nova Venda
                    </button>

                    <div className="hidden xl:flex bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm items-center gap-3 ml-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="font-bold text-[11px] text-slate-500 uppercase tracking-tighter">Hoje, 08 Fev</span>
                    </div>
                </div>
            </div>

            <AddClientModal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                onSuccess={() => alert('Cliente cadastrado com sucesso!')}
            />
            <AddProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSuccess={() => alert('Produto cadastrado com sucesso!')}
            />
            <AddSaleModal
                isOpen={isSaleModalOpen}
                onClose={() => setIsSaleModalOpen(false)}
                onSuccess={() => alert('Venda registrada com sucesso!')}
            />

            {/* Stats Grid - FOCADO EM PÓS-VENDA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Mensagens Enviadas"
                    value={loading ? "..." : stats.sent}
                    subtext="Registradas no sistema"
                    icon={MessageCircle}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    title="Engajamento"
                    value={loading ? "..." : `${stats.returnRate}%`}
                    subtext="Fidelidade estimada"
                    icon={CheckCircle2}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <StatCard
                    title="Base Monitorada"
                    value={loading ? "..." : stats.base}
                    subtext="Clientes únicos"
                    icon={Users}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
                <StatCard
                    title="Em Risco"
                    value={loading ? "..." : stats.atRisk}
                    subtext="Avisos pendentes atrasados"
                    icon={AlertCircle}
                    color="text-red-500"
                    bg="bg-red-50"
                />
            </div>

            {/* Recent Activity / Top VIPs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm min-h-[400px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-8 left-8">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Análise de Retenção</h3>
                        <p className="text-sm text-slate-500 font-medium">Frequência de compra vs Mensagens</p>
                    </div>
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                            <TrendingUp size={32} />
                        </div>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Gráfico em processamento...</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Top Fiéis 🏆</h3>
                        <button onClick={() => navigate('/clientes')} className="text-purple-600 font-bold text-xs hover:underline uppercase tracking-wider">Ver todos</button>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-center text-slate-400 py-10 font-medium tracking-tight italic">Carregando...</p>
                        ) : stats.topClients.length > 0 ? (
                            stats.topClients.map((client) => (
                                <div key={client.rank} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${client.rank === 1 ? 'bg-amber-100 text-amber-600' :
                                            client.rank === 2 ? 'bg-slate-200 text-slate-600' :
                                                'bg-slate-100 text-slate-400'
                                            }`}>
                                            {client.rank}º
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{client.nome}</p>
                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Cliente Frequente</p>
                                        </div>
                                    </div>
                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                        {client.compras} compras
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-400 py-10 font-medium tracking-tight italic">Nenhum dado encontrado.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
