import React, { useState, useEffect } from 'react';
import { Search, User, Phone, Calendar, MessageCircle, MoreVertical, Filter, Plus } from 'lucide-react';
import AddClientModal from '../components/AddClientModal';
import ClientHistoryModal from '../components/ClientHistoryModal';

const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    // Helper para buscar valor independente de maiúsculas/minúsculas/espaços
    const getValue = (item, keys) => {
        const itemKeys = Object.keys(item);
        for (const key of keys) {
            // Busca exata ou aproximada (case insensitive + trim)
            const foundKey = itemKeys.find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
            if (foundKey && item[foundKey]) return item[foundKey];
        }
        return '-';
    };

    const fetchClients = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://vmi3061755.contaboserver.net/webhook/pet-control/clientes');
            if (response.ok) {
                const data = await response.json();

                // Agrupamento por Nome + Telefone
                const grouped = data.reduce((acc, item) => {
                    const nome = String(getValue(item, ['Nome', 'name'])).trim();
                    const telefone = String(getValue(item, ['Telefone', 'phone'])).trim();
                    const key = `${nome.toLowerCase()}-${telefone}`;

                    const sale = {
                        produto: getValue(item, ['Produto', 'produtos', 'products']),
                        data: getValue(item, ['Data', 'dia', 'date']),
                        dataRaw: getValue(item, ['Data', 'dia', 'date']), // Para ordenação
                        proximoContato: getValue(item, ['Data de Envio', 'DataEnvio', 'Envio', 'proximoContato'])
                    };

                    if (!acc[key]) {
                        acc[key] = {
                            nome: nome,
                            telefone: telefone,
                            pet: getValue(item, ['Pet']),
                            history: [sale]
                        };
                    } else {
                        acc[key].history.push(sale);
                        // Atualiza Pet se estiver vazio no registro anterior
                        if (acc[key].pet === '-' || !acc[key].pet) {
                            acc[key].pet = getValue(item, ['Pet']);
                        }
                    }
                    return acc;
                }, {});

                // Converte em array e processa última compra
                const formattedClients = Object.values(grouped).map((client, index) => {
                    // Ordena histórico para pegar a última compra
                    const sortedHistory = [...client.history].sort((a, b) => new Date(b.dataRaw) - new Date(a.dataRaw));
                    const lastSale = sortedHistory[0];

                    return {
                        id: index + 1,
                        ...client,
                        ultimaCompra: lastSale,
                        // Para facilitar exibição na tabela
                        lastProduto: lastSale.produto,
                        lastData: lastSale.data,
                        proximoAviso: lastSale.proximoContato
                    };
                });

                // Ordenar por data da última compra (mais recente primeiro)
                formattedClients.sort((a, b) => new Date(b.ultimaCompra.dataRaw) - new Date(a.ultimaCompra.dataRaw));

                setClients(formattedClients);
            }
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = (e, client) => {
        e.stopPropagation(); // Evita abrir o modal de histórico ao clicar no WhatsApp
        // Garante que é string e limpa o telefone (deixa apenas números)
        const phoneStr = String(client.telefone || '');
        let phone = phoneStr.replace(/\D/g, '');

        // Se não tiver código do país (55), adiciona (assumindo Brasil)
        if (phone.length <= 11) {
            phone = `55${phone}`;
        }

        const message = `Olá ${client.nome}, tudo bem?`;
        const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

        window.open(url, '_blank');
    };

    const openHistory = (client) => {
        setSelectedClient(client);
        setIsHistoryModalOpen(true);
    };

    const filteredClients = clients.filter(client =>
        client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(client.telefone).includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-fade-in text-slate-800">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-2">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Base de Clientes</h2>
                    <p className="text-slate-500 text-sm font-medium">Controle total sobre sua carteira de fidelidade.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-[18px] focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/50 w-full sm:w-72 transition-all shadow-sm placeholder:text-slate-400 placeholder:font-medium text-sm"
                        />
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-[18px] font-bold transition-all shadow-xl shadow-slate-200 active:scale-95 text-sm"
                    >
                        <Plus size={20} />
                        Novo Cliente
                    </button>
                </div>
            </div>

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

            {/* Tabela de Clientes */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Última Compra</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Próximo Aviso</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Carregando base de clientes...
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Nenhum cliente encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr
                                        key={client.id}
                                        className="hover:bg-purple-50/30 transition-colors group cursor-pointer"
                                        onClick={() => openHistory(client)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                                                    {client.nome.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{client.nome}</p>
                                                    <p className="text-xs text-slate-500">Pet: {client.pet}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                                                <Phone size={16} className="text-slate-400" />
                                                {client.telefone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm text-slate-800 font-medium">{client.lastProduto}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {client.lastData}
                                                    {client.history.length > 1 && (
                                                        <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">
                                                            +{client.history.length - 1} compras
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${client.proximoAviso === '-' ? 'bg-slate-50 text-slate-400' : 'bg-blue-50 text-blue-700'
                                                }`}>
                                                {client.proximoAviso}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => handleWhatsApp(e, client)}
                                                className="text-slate-400 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-green-50"
                                                title="Enviar WhatsApp"
                                            >
                                                <MessageCircle size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 italic text-center">
                Dica: Clique em qualquer linha para ver o histórico completo de compras do cliente.
            </p>
        </div>
    );
};

export default ClientsPage;
