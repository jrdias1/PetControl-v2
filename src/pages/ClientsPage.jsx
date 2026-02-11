import React, { useState, useEffect } from 'react';
import { Search, Plus, Phone, Calendar, MessageCircle, PawPrint, Heart, ChevronRight, User as UserIcon, ShoppingBag } from 'lucide-react';
import AddClientModal from '../components/AddClientModal';
import ClientHistoryModal from '../components/ClientHistoryModal';
import RegisterSaleModal from '../components/RegisterSaleModal';
import { api } from '../services/api';
import { motion } from 'framer-motion';

const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [clientForSale, setClientForSale] = useState(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const data = await api.fetchClientsWithHistory();
            setClients(data);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = (e, client) => {
        e.stopPropagation();
        const phoneStr = String(client.telefone || '');
        let phone = phoneStr.replace(/\D/g, '');

        if (phone.length <= 11) {
            phone = `55${phone}`;
        }

        const message = `Olá ${client.nome}, tudo bem? Sentimos sua falta! 🐾`;
        const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

        window.open(url, '_blank');
    };

    const openHistory = (client) => {
        setSelectedClient(client);
        setIsHistoryModalOpen(true);
    };

    const openSaleModal = (e, client) => {
        e.stopPropagation();
        setClientForSale(client);
        setIsSaleModalOpen(true);
    };

    const filteredClients = (clients || []).filter(client =>
        (client.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(client.telefone || '').includes(searchTerm) ||
        (client.pet || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.02 }
        }
    };

    const rowVariants = {
        hidden: { opacity: 1, x: 0 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-10"
        >
            {/* Header */}
            <motion.div variants={rowVariants} className="flex flex-col lg:flex-row justify-between lg:items-end gap-8">
                <div>
                    <div className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                        <UserIcon size={14} fill="currentColor" />
                        Base de Dados
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Clientes</h2>
                    <p className="text-slate-500 font-medium italic mt-1">"Gerencie sua carteira de pets e fortaleça a fidelidade."</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar cliente ou pet..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 w-full sm:w-80 transition-all shadow-sm placeholder:text-slate-400 placeholder:font-black placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px] text-sm font-bold text-slate-700"
                        />
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-amber-200 active:scale-95 group"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        Novo Cliente
                    </button>
                </div>
            </motion.div>

            {/* Clientes Table/Cards List */}
            <motion.div
                variants={rowVariants}
                className="bg-white border border-slate-100 rounded-[40px] shadow-xl shadow-slate-200/40 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/30">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente & Companheiro</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contato</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Último Item</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Próximo Ciclo</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="inline-block animate-bounce text-amber-500 mb-2">
                                            <PawPrint size={32} />
                                        </div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Farejando dados...</p>
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <p className="text-slate-300 font-black text-xl italic tracking-tight">Nenhum cliente farejado 🔍</p>
                                        <p className="text-slate-400 text-sm mt-2 font-medium">Tente uma busca diferente ou adicione um novo.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <motion.tr
                                        key={client.id}
                                        variants={rowVariants}
                                        className="hover:bg-amber-50/30 transition-all group cursor-pointer"
                                        onClick={() => openHistory(client)}
                                    >
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors relative overflow-hidden shadow-inner">
                                                    <span className="font-black text-sm z-10">{(client.nome || 'P').charAt(0).toUpperCase()}</span>
                                                    <PawPrint className="absolute -right-2 -bottom-2 opacity-10 group-hover:rotate-12 transition-transform" size={32} fill="currentColor" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">{client.nome || 'Sem Nome'}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Heart size={10} fill="#f43f5e" className="text-rose-500" />
                                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter capitalize">{client.pet || 'Pet'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="inline-flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-xl border border-transparent group-hover:border-slate-100 transition-all">
                                                <Phone size={14} className="text-slate-400" />
                                                {client.telefone}
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div>
                                                <p className="text-sm text-slate-900 font-black tracking-tight leading-none mb-1">{client.lastProduto}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        <Calendar size={10} />
                                                        {client.lastData}
                                                    </div>
                                                    {client.history.length > 1 && (
                                                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                                            {client.history.length} visitas
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className={`inline-flex flex-col ${client.proximoAviso === '-' ? 'opacity-30' : ''}`}>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">Previsão</span>
                                                <span className={`text-sm font-black tracking-tight ${client.proximoAviso === '-' ? 'text-slate-400' : 'text-amber-600'}`}>
                                                    {client.proximoAviso}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => openSaleModal(e, client)}
                                                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50 transition-all rounded-xl shadow-sm"
                                                    title="Nova Venda"
                                                >
                                                    <ShoppingBag size={20} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleWhatsApp(e, client)}
                                                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all rounded-xl shadow-sm"
                                                    title="Conversar"
                                                >
                                                    <MessageCircle size={20} />
                                                </button>
                                                <div className="p-2 text-slate-300 group-hover:translate-x-1 group-hover:text-amber-500 transition-all">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <motion.p variants={rowVariants} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center italic">
                Dica: Toque no cliente para visualizar o histórico emocional e transacional. 🐾
            </motion.p>

            <AddClientModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchClients}
            />

            <ClientHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                client={selectedClient}
            />

            <RegisterSaleModal
                isOpen={isSaleModalOpen}
                onClose={() => setIsSaleModalOpen(false)}
                onSuccess={fetchClients}
                client={clientForSale}
            />
        </motion.div>
    );
};

export default ClientsPage;
