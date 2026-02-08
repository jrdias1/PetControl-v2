import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MessageSquare, Send, User, Search, Trash2, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import AddClientModal from '../components/AddClientModal';

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

    useEffect(() => {
        fetchClients();
        fetchScheduledMessages();
    }, []);

    const fetchScheduledMessages = async () => {
        try {
            const response = await fetch('https://vmi3061755.contaboserver.net/webhook/pet-control/listar-agenda');
            if (response.ok) {
                const data = await response.json();

                // Garantir que temos um array antes de mapear
                if (!Array.isArray(data)) {
                    console.error('Resposta do n8n não é um array:', data);
                    setScheduledMessages([]);
                    return;
                }

                const formatted = data.map((item, index) => ({
                    id: item.row_number || index + 1,
                    clientName: item.Cliente || item.cliente || '-',
                    clientPhone: item.Telefone || item.telefone || '-',
                    message: item.Mensagem || item.mensagem || '-',
                    date: item['Data de Envio'] || item.data_envio || '-',
                    time: item['Hora de Envio'] || item.hora_envio || '-',
                    status: (item.Status || item.status || 'Pendente').toLowerCase() === 'enviado' ? 'sent' : 'scheduled'
                }));
                setScheduledMessages(formatted);
            }
        } catch (error) {
            console.error('Erro ao buscar agenda:', error);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await fetch('https://vmi3061755.contaboserver.net/webhook/pet-control/clientes');
            if (response.ok) {
                const data = await response.json();
                const formatted = data.map((item, index) => ({
                    id: index + 1,
                    nome: String(item.Nome || item.name || '-'),
                    telefone: String(item.Telefone || item.phone || '-'),
                    pet: String(item.Pet || '-'),
                }));
                setClients(formatted);
            }
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        }
    };

    const handleNewClientSuccess = (newClient) => {
        // Refresh client list
        fetchClients();
        // Automatically select the new client
        setSelectedClient({
            nome: newClient.nome,
            telefone: newClient.telefone,
            pet: newClient.pet
        });
        setSearchTerm('');
        setShowClientList(false);
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        if (!selectedClient || !message || !date || !time) return;

        const payload = {
            status: 'Pendente',
            cliente: selectedClient.nome,
            telefone: selectedClient.telefone,
            mensagem: message,
            data_envio: date.split('-').reverse().join('/'), // Converte YYYY-MM-DD para DD/MM/YYYY
            hora_envio: time
        };

        try {
            const response = await fetch('https://vmi3061755.contaboserver.net/webhook/pet-control/agenda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const newMessage = {
                    id: Date.now(),
                    clientName: selectedClient.nome,
                    clientPhone: selectedClient.telefone,
                    message: message,
                    date: payload.data_envio,
                    time: time,
                    status: 'scheduled'
                };

                const updated = [newMessage, ...scheduledMessages];
                setScheduledMessages(updated);
                localStorage.setItem('petcontrol_scheduled_messages', JSON.stringify(updated));

                // Reset form
                setMessage('');
                setSelectedClient(null);
                setSearchTerm('');
                setDate('');
                setTime('');
                alert('Mensagem agendada com sucesso!');
            } else {
                alert('Erro ao agendar mensagem no n8n.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão ao agendar.');
        }
    };

    const deleteScheduled = (id) => {
        const updated = scheduledMessages.filter(m => m.id !== id);
        setScheduledMessages(updated);
        localStorage.setItem('petcontrol_scheduled_messages', JSON.stringify(updated));
    };

    const handleSend = (msg) => {
        // Limpa o telefone
        let phone = msg.clientPhone.replace(/\D/g, '');
        if (phone.length <= 11) phone = `55${phone}`;

        const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg.message)}`;
        window.open(url, '_blank');

        // Atualiza o status para 'sent'
        const updated = scheduledMessages.map(m =>
            m.id === msg.id ? { ...m, status: 'sent' } : m
        );
        setScheduledMessages(updated);
        localStorage.setItem('petcontrol_scheduled_messages', JSON.stringify(updated));
    };

    const filteredClients = clients.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(c.telefone).includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-2">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Agenda</h2>
                    <p className="text-slate-500 text-sm font-medium">Programe avisos automáticos para seus clientes.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="font-bold text-[11px] text-slate-500 uppercase tracking-tighter">
                            {scheduledMessages.filter(m => m.status === 'scheduled').length} Pendentes hoje
                        </span>
                    </div>
                </div>
            </div>

            <AddClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleNewClientSuccess}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Calendar className="text-purple-600" size={20} />
                                Novo Agendamento
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-xs flex items-center gap-1 bg-purple-50 text-purple-700 font-bold px-2 py-1 rounded hover:bg-purple-100 transition-colors"
                            >
                                <Plus size={14} />
                                Novo Cliente
                            </button>
                        </div>

                        <form onSubmit={handleSchedule} className="space-y-4">
                            {/* Client Selector */}
                            <div className="space-y-1 relative">
                                <label className="text-sm font-semibold text-slate-700">Selecione o Cliente</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome..."
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none"
                                        value={selectedClient ? selectedClient.nome : searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setSelectedClient(null);
                                            setShowClientList(true);
                                        }}
                                        onFocus={() => setShowClientList(true)}
                                    />
                                    {showClientList && searchTerm && !selectedClient && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {filteredClients.map(client => (
                                                <button
                                                    key={client.id}
                                                    type="button"
                                                    className="w-full text-left px-4 py-2 hover:bg-purple-50 flex flex-col border-b border-slate-50 last:border-0"
                                                    onClick={() => {
                                                        setSelectedClient(client);
                                                        setShowClientList(false);
                                                    }}
                                                >
                                                    <span className="font-medium text-slate-800">{client.nome}</span>
                                                    <span className="text-xs text-slate-500">{client.pet ? `Pet: ${client.pet}` : client.telefone}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message Box */}
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700">Mensagem</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none h-32 resize-none"
                                    placeholder="Escreva a mensagem aqui..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Data</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">Horário</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!selectedClient || !message || !date || !time}
                                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-4"
                            >
                                <Send size={18} />
                                Agendar Agora
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Column */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <CheckCircle2 className="text-green-500" size={20} />
                                Mensagens Agendadas
                            </h3>
                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-semibold">
                                {scheduledMessages.length} total
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {scheduledMessages.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-slate-400 italic">
                                    <AlertCircle size={48} className="mb-2 opacity-20" />
                                    <p>Nenhuma mensagem agendada para hoje.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {scheduledMessages.map((msg) => (
                                        <div key={msg.id} className={`p-4 border rounded-lg transition-all flex justify-between items-start group ${msg.status === 'sent' ? 'bg-slate-50 border-slate-100 opacity-75' : 'bg-white border-slate-100 hover:border-purple-100'}`}>
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${msg.status === 'sent' ? 'bg-slate-200 text-slate-500' : 'bg-purple-100 text-purple-600'}`}>
                                                        {msg.clientName.charAt(0).toUpperCase()}
                                                    </span>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold text-slate-800">{msg.clientName}</p>
                                                            {msg.status === 'sent' ? (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold uppercase tracking-wider">Enviado</span>
                                                            ) : (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold uppercase tracking-wider">Pendente</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[11px] flex items-center gap-1 text-slate-500">
                                                                <Calendar size={12} /> {msg.date}
                                                            </span>
                                                            <span className="text-[11px] flex items-center gap-1 text-slate-500">
                                                                <Clock size={12} /> {msg.time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/80 p-3 rounded border border-slate-100 text-sm text-slate-600 italic">
                                                    "{msg.message}"
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 ml-4">
                                                <button
                                                    onClick={() => handleSend(msg)}
                                                    className={`p-2 rounded-full transition-colors ${msg.status === 'sent' ? 'text-slate-400 hover:bg-slate-100' : 'text-green-600 hover:bg-green-50'}`}
                                                    title="Enviar via WhatsApp"
                                                >
                                                    <MessageSquare size={20} />
                                                </button>
                                                <button
                                                    onClick={() => deleteScheduled(msg.id)}
                                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                    title="Remover"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleMessagePage;
