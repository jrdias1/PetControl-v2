import React, { useState, useEffect } from 'react';
import { X, User, Package, Calendar, Loader2, Search, CheckCircle2 } from 'lucide-react';

const AddSaleModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [clientSearch, setClientSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [showClientList, setShowClientList] = useState(false);
    const [showProductList, setShowProductList] = useState(false);

    const [formData, setFormData] = useState({
        clienteId: '',
        nome: '',
        telefone: '',
        pet: '',
        produto: '',
        data: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isOpen) {
            fetchClients();
            fetchProducts();
        }
    }, [isOpen]);

    // Helper para buscar valor independente de maiúsculas/minúsculas/espaços
    const getValue = (item, keys) => {
        const itemKeys = Object.keys(item);
        for (const key of keys) {
            const foundKey = itemKeys.find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
            if (foundKey && item[foundKey]) return item[foundKey];
        }
        return null;
    };

    const fetchClients = async () => {
        try {
            const response = await fetch('https://vmi3061755.contaboserver.net/webhook/pet-control/clientes');
            if (response.ok) {
                const data = await response.json();
                const formatted = data.map((item, index) => ({
                    id: index + 1,
                    nome: getValue(item, ['Nome', 'name']) || 'Sem Nome',
                    telefone: getValue(item, ['Telefone', 'phone']) || '-',
                    pet: getValue(item, ['Pet']) || '-'
                }));
                setClients(formatted);
            }
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('https://vmi3061755.contaboserver.net/webhook/pet-control/produtos');
            if (response.ok) {
                const data = await response.json();
                const formatted = data.map((item, index) => ({
                    id: index + 1,
                    nome: getValue(item, ['Termo', 'nome', 'name']) || 'Sem Nome'
                }));
                setProducts(formatted);
            }
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nome || !formData.produto) {
            alert('Por favor, selecione um cliente e um produto.');
            return;
        }

        setLoading(true);

        try {
            // Envia para o mesmo webhook de venda (test)
            const response = await fetch('https://vmi3061755.contaboserver.net/webhook/pet-control/venda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: formData.nome,
                    telefone: formData.telefone,
                    pet: formData.pet,
                    produto: formData.produto,
                    data: formData.data
                }),
            });

            if (response.ok) {
                onSuccess();
                onClose();
                setFormData({ clienteId: '', nome: '', telefone: '', pet: '', produto: '', data: new Date().toISOString().split('T')[0] });
                setClientSearch('');
                setProductSearch('');
            } else {
                alert('Erro ao registrar venda no n8n.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(c =>
        c.nome.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.telefone.includes(clientSearch)
    );

    const filteredProducts = products.filter(p =>
        p.nome.toLowerCase().includes(productSearch.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Package className="text-blue-600" size={24} />
                        Adicionar Nova Venda
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Client Select */}
                    <div className="space-y-1 relative">
                        <label className="text-sm font-semibold text-slate-700">Cliente</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                type="text"
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${formData.nome ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200'}`}
                                placeholder="Procurar cliente..."
                                value={formData.nome || clientSearch}
                                onChange={(e) => {
                                    setClientSearch(e.target.value);
                                    setFormData({ ...formData, nome: '', telefone: '', pet: '' });
                                    setShowClientList(true);
                                }}
                                onFocus={() => setShowClientList(true)}
                            />
                            {showClientList && (
                                <div className="absolute z-[80] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredClients.length > 0 ? (
                                        filteredClients.map(client => (
                                            <button
                                                key={client.id}
                                                type="button"
                                                className="w-full text-left px-4 py-2 hover:bg-blue-50 flex flex-col border-b border-slate-50 last:border-0"
                                                onClick={() => {
                                                    setFormData({ ...formData, nome: client.nome, telefone: client.telefone, pet: client.pet });
                                                    setClientSearch('');
                                                    setShowClientList(false);
                                                }}
                                            >
                                                <span className="font-medium text-slate-800">{client.nome}</span>
                                                <span className="text-xs text-slate-500">{client.pet} • {client.telefone}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-slate-500">Nenhum cliente encontrado.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Select */}
                    <div className="space-y-1 relative">
                        <label className="text-sm font-semibold text-slate-700">Produto</label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                type="text"
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${formData.produto ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200'}`}
                                placeholder="Procurar produto..."
                                value={formData.produto || productSearch}
                                onChange={(e) => {
                                    setProductSearch(e.target.value);
                                    setFormData({ ...formData, produto: '' });
                                    setShowProductList(true);
                                }}
                                onFocus={() => setShowProductList(true)}
                            />
                            {showProductList && (
                                <div className="absolute z-[80] w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map(product => (
                                            <button
                                                key={product.id}
                                                type="button"
                                                className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                                                onClick={() => {
                                                    setFormData({ ...formData, produto: product.nome });
                                                    setProductSearch('');
                                                    setShowProductList(false);
                                                }}
                                            >
                                                <span className="font-medium text-slate-800">{product.nome}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-slate-500">Nenhum produto encontrado.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Data da Venda</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                type="date"
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                                value={formData.data}
                                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.nome || !formData.produto}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Registrar Venda'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSaleModal;
