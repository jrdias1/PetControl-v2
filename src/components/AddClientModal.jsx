import React, { useState, useEffect } from 'react';
import { X, User, Phone, Package, Calendar, Loader2, Search, Heart, PawPrint } from 'lucide-react';
import { api } from '../services/api';

const AddClientModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showProductList, setShowProductList] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        pet: '',
        produto: '',
        data: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    const fetchProducts = async () => {
        try {
            const data = await api.fetchProducts();
            setProducts(data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.produto) {
            alert('Por favor, selecione um produto da lista.');
            return;
        }

        setLoading(true);

        try {
            const success = await api.addClient(formData);

            if (success) {
                onSuccess(formData);
                onClose();
            }
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 relative group">
                {/* Decoration */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-50 rounded-full opacity-50 pointer-events-none" />

                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-amber-50/30 relative z-10">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white text-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                            <User size={22} fill="currentColor" className="opacity-70" />
                        </div>
                        Novo Cliente
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Identificação</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500" size={18} />
                            <input
                                required
                                type="text"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-slate-700"
                                placeholder="Nome Completo"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="text"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 outline-none transition-all font-bold text-slate-700"
                                    placeholder="51999999999"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Companheiro (Pet)</label>
                            <div className="relative">
                                <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} fill="currentColor" />
                                <input
                                    required
                                    type="text"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 outline-none transition-all font-bold text-slate-700"
                                    placeholder="Nome do Pet"
                                    value={formData.pet}
                                    onChange={(e) => setFormData({ ...formData, pet: e.target.value })}
                                />
                            </div>
                        </div>
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
                            Voltar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (!formData.produto && searchTerm)}
                            className="flex-[2] py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-300 shadow-xl shadow-amber-100 active:scale-95 group"
                        >
                            {loading ? <Loader2 className="animate-spin text-white" size={20} /> : (
                                <>
                                    <span>Salvar Cliente</span>
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

export default AddClientModal;
