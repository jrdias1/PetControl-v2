import React, { useState, useEffect } from 'react';
import { X, User, Package, Calendar, Loader2, PawPrint, Search } from 'lucide-react';
import { api } from '../services/api';

const RegisterSaleModal = ({ isOpen, onClose, onSuccess, client: initialClient }) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Select Client (if null), 2: Select Product
    const [selectedClient, setSelectedClient] = useState(null);
    const [clients, setClients] = useState([]);
    const [clientSearch, setClientSearch] = useState('');

    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showProductList, setShowProductList] = useState(false);
    const [formData, setFormData] = useState({
        produto: '',
        data: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isOpen) {
            if (initialClient) {
                setSelectedClient(initialClient);
                setStep(2);
            } else {
                setSelectedClient(null);
                setStep(1);
                fetchClients();
            }
            fetchProducts();
            setFormData(prev => ({ ...prev, produto: '' }));
            setSearchTerm('');
            setClientSearch('');
        }
    }, [isOpen, initialClient]);

    const fetchProducts = async () => {
        try {
            const data = await api.fetchProducts();
            setProducts(data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
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

    if (!isOpen) return null;

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.produto) {
            alert('Por favor, selecione um produto da lista.');
            return;
        }

        setLoading(true);

        try {
            const success = await api.registerSale({
                clientId: selectedClient.id,
                produto: formData.produto,
                data: formData.data,
                nome: selectedClient.nome,
                telefone: selectedClient.telefone,
                pet: selectedClient.pet
            });

            if (success) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            alert('Erro ao registrar venda: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredClients = clients.filter(c =>
        (c.nome || '').toLowerCase().includes(clientSearch.toLowerCase()) ||
        String(c.telefone || '').includes(clientSearch)
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 relative group">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-amber-50/30 relative z-10">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white text-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                            <Package size={22} fill="currentColor" className="opacity-70" />
                        </div>
                        Nova Venda {step === 1 && !initialClient && '- Selecionar Cliente'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {step === 1 && (
                    <div className="p-8 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                autoFocus
                                type="text"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 outline-none transition-all font-bold text-slate-700"
                                placeholder="Buscar cliente por nome ou telefone..."
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                            {filteredClients.length > 0 ? filteredClients.map(client => (
                                <button
                                    key={client.id}
                                    onClick={() => handleClientSelect(client)}
                                    className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-all flex items-center gap-4 text-left group"
                                >
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-amber-500 font-black shadow-sm">
                                        {client.nome.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{client.nome}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <PawPrint size={10} /> {client.pet}
                                        </p>
                                    </div>
                                </button>
                            )) : (
                                <p className="text-center text-slate-400 text-sm font-medium py-4">Nenhum cliente encontrado.</p>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && selectedClient && (
                    <form onSubmit={handleSubmit} className="p-8 space-y-6 relative z-10 animate-in slide-in-from-right-4 duration-300">
                        <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 font-black shadow-sm">
                                {selectedClient.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cliente</p>
                                <p className="font-bold text-slate-900 text-lg leading-tight">{selectedClient.nome}</p>
                                <p className="text-xs text-amber-600 font-bold flex items-center gap-1 mt-0.5"><PawPrint size={10} /> {selectedClient.pet}</p>
                            </div>
                            {!initialClient && (
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="ml-auto text-xs font-bold text-amber-500 hover:text-amber-600 underline"
                                >
                                    Trocar
                                </button>
                            )}
                        </div>

                        {/* Searchable Product Select */}
                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Produto Adquirido</label>
                            <div className="relative">
                                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500" size={18} />
                                <input
                                    required
                                    type="text"
                                    className={`w-full pl-12 pr-12 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-700 ${!formData.produto && searchTerm ? 'border-amber-300 bg-white' : ''}`}
                                    placeholder="Pesquisar catálogo..."
                                    value={formData.produto ? formData.produto : searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setFormData({ ...formData, produto: '' });
                                        setShowProductList(true);
                                    }}
                                    onFocus={() => setShowProductList(true)}
                                />
                                {formData.produto && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="p-1 bg-emerald-500 text-white rounded-full">
                                            <X size={12} className="cursor-pointer" onClick={() => {
                                                setFormData({ ...formData, produto: '' });
                                                setSearchTerm('');
                                            }} />
                                        </div>
                                    </div>
                                )}
                                {showProductList && (
                                    <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200 max-h-56 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                        <div className="overflow-y-auto max-h-56">
                                            {filteredProducts.length > 0 ? (
                                                filteredProducts.map(product => (
                                                    <button
                                                        key={product.id}
                                                        type="button"
                                                        className="w-full text-left px-5 py-4 hover:bg-amber-50 flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors"
                                                        onClick={() => {
                                                            setFormData({ ...formData, produto: product.nome });
                                                            setSearchTerm('');
                                                            setShowProductList(false);
                                                        }}
                                                    >
                                                        <span className="font-black text-slate-800 text-sm tracking-tight">{product.nome}</span>
                                                        <div className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded uppercase tracking-widest">{product.duracao} dias</div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="p-6 text-center text-slate-400 italic text-sm font-medium">Nenhum produto farejado...</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Data da Venda</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="date"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 outline-none transition-all font-bold text-slate-700"
                                    value={formData.data}
                                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-900 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || (!formData.produto && searchTerm)}
                                className="flex-[2] py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-300 shadow-xl shadow-amber-100 active:scale-95 group"
                            >
                                {loading ? <Loader2 className="animate-spin text-white" size={20} /> : (
                                    <>
                                        <span>Registrar Venda</span>
                                        <Package size={18} className="group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RegisterSaleModal;
