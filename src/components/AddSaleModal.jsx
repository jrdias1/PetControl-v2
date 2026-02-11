import React, { useState, useEffect } from 'react';
import { X, User, Package, Calendar, Loader2, Search, PawPrint, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';

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
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        try {
            const [clientsData, productsData] = await Promise.all([
                api.fetchClients(),
                api.fetchProducts()
            ]);
            setClients(clientsData);
            setProducts(productsData.map(p => ({ ...p, id: p.id, nome: p.name })));
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nome || !formData.produto) {
            return;
        }

        setLoading(true);

        try {
            const success = await api.registerSale({
                clientId: formData.clienteId,
                nome: formData.nome,
                telefone: formData.telefone,
                pet: formData.pet,
                produto: formData.produto,
                data: formData.data
            });

            if (success) {
                onSuccess();
                onClose();
                setFormData({ clienteId: '', nome: '', telefone: '', pet: '', produto: '', data: new Date().toISOString().split('T')[0] });
                setClientSearch('');
                setProductSearch('');
            }
        } catch (error) {
            console.error('Erro:', error);
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 relative group">
                {/* Decoration */}
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-50 rounded-full opacity-50 pointer-events-none" />

                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-amber-50/30 relative z-10">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white text-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                            <ShoppingBag size={22} fill="currentColor" className="opacity-70" />
                        </div>
                        Registrar Venda
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 relative z-10">
                    {/* Client Select */}
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Cliente</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500" size={18} />
                            <input
                                required
                                type="text"
                                className={`w-full pl-12 pr-12 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-700 ${formData.nome ? 'bg-white border-amber-100 ring-2 ring-amber-500/5' : ''}`}
                                placeholder="Procurar cliente cadastrado..."
                                value={formData.nome || clientSearch}
                                onChange={(e) => {
                                    setClientSearch(e.target.value);
                                    setFormData({ ...formData, nome: '', telefone: '', pet: '' });
                                    setShowClientList(true);
                                }}
                                onFocus={() => setShowClientList(true)}
                            />
                            {formData.nome && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="p-1 bg-amber-100 text-amber-600 rounded-full cursor-pointer hover:bg-amber-200 transition-colors" onClick={() => {
                                        setFormData({ ...formData, nome: '', clienteId: '' });
                                        setClientSearch('');
                                    }}>
                                        <X size={12} />
                                    </div>
                                </div>
                            )}
                            {showClientList && (
                                <div className="absolute z-[80] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200 max-h-56 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                    <div className="overflow-y-auto max-h-56">
                                        {filteredClients.length > 0 ? (
                                            filteredClients.map(client => (
                                                <button
                                                    key={client.id}
                                                    type="button"
                                                    className="w-full text-left px-5 py-4 hover:bg-amber-50 flex flex-col border-b border-slate-50 last:border-0 transition-colors"
                                                    onClick={() => {
                                                        setFormData({ ...formData, clienteId: client.id, nome: client.nome, telefone: client.telefone, pet: client.pet });
                                                        setClientSearch('');
                                                        setShowClientList(false);
                                                    }}
                                                >
                                                    <span className="font-black text-slate-800 text-sm tracking-tight">{client.nome}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2 mt-0.5">
                                                        <span className="text-amber-500">🐾 {client.pet}</span>
                                                        <span>•</span>
                                                        <span>{client.telefone}</span>
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-6 text-center text-slate-400 italic text-sm font-medium">Nenhum cliente farejado...</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Select */}
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Produto</label>
                        <div className="relative">
                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500" size={18} />
                            <input
                                required
                                type="text"
                                className={`w-full pl-12 pr-12 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-700 ${formData.produto ? 'bg-white border-amber-100 ring-2 ring-amber-500/5' : ''}`}
                                placeholder="Buscar no catálogo..."
                                value={formData.produto || productSearch}
                                onChange={(e) => {
                                    setProductSearch(e.target.value);
                                    setFormData({ ...formData, produto: '' });
                                    setShowProductList(true);
                                }}
                                onFocus={() => setShowProductList(true)}
                            />
                            {formData.produto && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="p-1 bg-amber-100 text-amber-600 rounded-full cursor-pointer hover:bg-amber-200 transition-colors" onClick={() => {
                                        setFormData({ ...formData, produto: '' });
                                        setProductSearch('');
                                    }}>
                                        <X size={12} />
                                    </div>
                                </div>
                            )}
                            {showProductList && (
                                <div className="absolute z-[80] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200 max-h-56 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                    <div className="overflow-y-auto max-h-56">
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map(product => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    className="w-full text-left px-5 py-4 hover:bg-amber-50 flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors"
                                                    onClick={() => {
                                                        setFormData({ ...formData, produto: product.nome });
                                                        setProductSearch('');
                                                        setShowProductList(false);
                                                    }}
                                                >
                                                    <span className="font-black text-slate-800 text-sm tracking-tight">{product.nome}</span>
                                                    <div className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded uppercase tracking-widest">{product.duracao} dias</div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-6 text-center text-slate-400 italic text-sm font-medium">Produto não encontrado...</div>
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
                            Voltar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.nome || !formData.produto}
                            className="flex-[2] py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-300 shadow-xl shadow-amber-100 active:scale-95 group"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                                <>
                                    <span>Finalizar Venda</span>
                                    <PawPrint size={18} className="group-hover:rotate-12 transition-transform" fill="currentColor" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSaleModal;
