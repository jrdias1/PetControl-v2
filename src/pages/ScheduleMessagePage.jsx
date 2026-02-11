import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Send, CheckCircle2, AlertCircle, Clock, MessageSquare, Trash2, PawPrint, Zap, ChevronRight, MessageCircle } from 'lucide-react';
import AddClientModal from '../components/AddClientModal';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const ScheduleMessagePage = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [scheduledMessages, setScheduledMessages] = useState([]);
    const [showClientList, setShowClientList] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchClients(), fetchScheduledMessages()]);
            setLoading(false);
        };
        loadAll();
    }, []);

    const fetchScheduledMessages = async () => {
        try {
            const data = await api.fetchAgenda();
            setScheduledMessages(data);
        } catch (error) {
            console.error('Erro ao buscar agenda:', error);
        }
    };

    const fetchClients = async () => {
        try {
            const data = await api.fetchClients();
            setClients(data);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        }
    };

    const handleNewClientSuccess = (newClient) => {
        fetchClients();
        setSelectedClient(newClient);
        setSearchTerm('');
        setShowClientList(false);
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        if (!selectedClient || !message || !date || !time) return;

        const payload = {
            status: 'scheduled',
            cliente: selectedClient.nome,
            telefone: selectedClient.telefone,
            mensagem: message,
            data_envio: date,
            hora_envio: time
        };

        try {
            const success = await api.scheduleMessage(payload);

            if (success) {
                fetchScheduledMessages();
                setMessage('');
                setSelectedClient(null);
                setSearchTerm('');
                setDate('');
                setTime('');
            }
        } catch (error) {
            console.error('Erro:', error);
        }
    };

    const deleteScheduled = async (id) => {
        const updated = scheduledMessages.filter(m => m.id !== id);
        setScheduledMessages(updated);
    };

    const handleSend = async (msg) => {
        let phone = msg.clientPhone.replace(/\D/g, '');
        if (phone.length <= 11) phone = `55${phone}`;

        const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg.message)}`;
        window.open(url, '_blank');

        try {
            await api.updateMessageStatus(msg.id, 'sent');
            const updated = scheduledMessages.map(m =>
                m.id === msg.id ? { ...m, status: 'sent' } : m
            );
            setScheduledMessages(updated);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const filteredClients = clients.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(c.telefone).includes(searchTerm)
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-10"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between lg:items-end gap-8">
                <div>
                    <div className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                        <Calendar size={14} fill="currentColor" />
                        Planejamento Semanal
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Agenda</h2>
                    <p className="text-slate-500 font-medium italic mt-1">"Mantenha o coração do seu pet shop batendo forte com avisos automáticos."</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-50"></div>
                        <div className="flex flex-col">
                            <span className="font-black text-[10px] text-slate-400 uppercase tracking-widest leading-none mb-1">Status Ativo</span>
                            <span className="font-black text-sm text-slate-700 leading-none">
                                {scheduledMessages.filter(m => m.status === 'scheduled').length} Pendentes hoje
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleNewClientSuccess}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Form Column */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <div className="bg-white border border-slate-100 rounded-[40px] shadow-xl shadow-slate-200/40 p-8 sticky top-10 overflow-hidden group">
                        {/* Decoration */}
                        <div className="absolute -left-10 -top-10 w-32 h-32 bg-amber-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                        <Plus size={20} />
                                    </div>
                                    Novo Agendamento
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 px-3 py-1.5 rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                                >
                                    Adicionar Cliente
                                </button>
                            </div>

                            <form onSubmit={handleSchedule} className="space-y-6">
                                {/* Client Selector */}
                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Buscar por nome..."
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-700"
                                            value={selectedClient ? selectedClient.nome : searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setSelectedClient(null);
                                                setShowClientList(true);
                                            }}
                                            onFocus={() => setShowClientList(true)}
                                        />
                                        {showClientList && searchTerm && !selectedClient && (
                                            <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200 max-h-56 overflow-hidden">
                                                <div className="overflow-y-auto max-h-56">
                                                    {filteredClients.map(client => (
                                                        <button
                                                            key={client.id}
                                                            type="button"
                                                            className="w-full text-left px-5 py-4 hover:bg-amber-50 flex flex-col border-b border-slate-50 last:border-0 transition-colors"
                                                            onClick={() => {
                                                                setSelectedClient(client);
                                                                setShowClientList(false);
                                                            }}
                                                        >
                                                            <span className="font-black text-slate-800 text-sm tracking-tight">{client.nome}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{client.pet ? `Pet: ${client.pet}` : client.telefone}</span>
                                                        </button>
                                                    ))}
                                                    {filteredClients.length === 0 && (
                                                        <div className="p-6 text-center text-slate-400 italic text-sm font-medium">Nenhum cliente farejado...</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Message Box */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensagem Emocional</label>
                                    <textarea
                                        className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-500/5 outline-none h-36 resize-none transition-all font-medium text-slate-700 leading-relaxed"
                                        placeholder="Ex: Olá Thor! Sentimos sua falta. Que tal um banho relaxante hoje? 🐾"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    ></textarea>
                                </div>

                                {/* Date and Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                                        <input
                                            type="date"
                                            className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 outline-none transition-all font-bold text-slate-700"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
                                        <input
                                            type="time"
                                            className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 outline-none transition-all font-bold text-slate-700"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!selectedClient || !message || !date || !time}
                                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-100 disabled:text-slate-300 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all mt-6 shadow-xl shadow-amber-100 group active:scale-95"
                                >
                                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    Confirmar Agendamento
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>

                {/* List Column */}
                <motion.div variants={itemVariants} className="lg:col-span-3">
                    <div className="bg-white border border-slate-100 rounded-[40px] shadow-xl shadow-slate-200/40 overflow-hidden h-full flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                                    <Clock size={22} fill="currentColor" className="opacity-70" />
                                </div>
                                Linha do Tempo
                            </h3>
                            <span className="bg-amber-100 text-amber-700 text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest">
                                {scheduledMessages.length} Lembretes
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center py-20">
                                    <div className="animate-spin text-amber-500 mb-4">
                                        <Clock size={40} />
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Organizando horários...</p>
                                </div>
                            ) : scheduledMessages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-huge flex items-center justify-center mb-6 text-slate-200">
                                        <MessageSquare size={48} />
                                    </div>
                                    <p className="text-xl font-black text-slate-300 tracking-tight">Céu limpo por aqui 🐾</p>
                                    <p className="text-slate-400 text-sm mt-2 font-medium">Nenhuma mensagem agendada no radar.</p>
                                </div>
                            ) : (
                                <AnimatePresence mode="popLayout text">
                                    {scheduledMessages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className={`p-6 border rounded-[32px] transition-all flex flex-col md:flex-row justify-between items-start md:items-center group relative overflow-hidden ${msg.status === 'sent'
                                                    ? 'bg-slate-50/50 border-slate-100 grayscale-[0.5] opacity-60'
                                                    : 'bg-white border-slate-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/30'
                                                }`}
                                        >
                                            <div className="flex-1 flex gap-5 items-start">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base shadow-inner group-hover:scale-110 transition-transform ${msg.status === 'sent' ? 'bg-slate-200 text-slate-500' : 'bg-amber-100 text-amber-600'
                                                    }`}>
                                                    {msg.clientName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center flex-wrap gap-2">
                                                        <p className="text-lg font-black text-slate-900 tracking-tight leading-none">{msg.clientName}</p>
                                                        {msg.status === 'sent' ? (
                                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-black uppercase tracking-widest border border-emerald-200">Enviado</span>
                                                        ) : (
                                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-black uppercase tracking-widest border border-amber-200">Agendado</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            <Calendar size={12} className="text-amber-500" /> {msg.date}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            <Clock size={12} className="text-amber-500" /> {msg.time}
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-50 p-4 rounded-2xl text-sm text-slate-600 font-medium italic border border-transparent group-hover:bg-white group-hover:border-slate-100 transition-colors mt-2">
                                                        "{msg.message}"
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex md:flex-col gap-3 ml-auto md:ml-8 mt-4 md:mt-0 relative z-10">
                                                <button
                                                    onClick={() => handleSend(msg)}
                                                    className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all shadow-sm ${msg.status === 'sent'
                                                            ? 'bg-slate-100 text-slate-400'
                                                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100 active:scale-90'
                                                        }`}
                                                    title="Enviar agora no WhatsApp"
                                                >
                                                    <MessageCircle size={24} />
                                                </button>
                                                <button
                                                    onClick={() => deleteScheduled(msg.id)}
                                                    className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-300 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                                                    title="Remover lembrete"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>

                                            {/* Decoration */}
                                            {msg.status !== 'sent' && (
                                                <div className="absolute -right-4 -bottom-4 text-emerald-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                                    <PawPrint size={100} fill="currentColor" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.p variants={itemVariants} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center pt-8">
                Smart Recall System • v2.1 • Smart Pet Care 🐾
            </motion.p>
        </motion.div>
    );
};

export default ScheduleMessagePage;
