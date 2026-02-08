import React, { useState, useEffect } from 'react';
import { X, User, Phone, Package, Calendar, Loader2, Search } from 'lucide-react';

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
            const response = await fetch('https://vmi3061755.contaboserver.net/webhook/pet-control/produtos');
            if (response.ok) {
                const data = await response.json();

                // Helper para buscar valor independente de maiúsculas/minúsculas/espaços
                const getValue = (item, keys) => {
                    const itemKeys = Object.keys(item);
                    for (const key of keys) {
                        const foundKey = itemKeys.find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
                        if (foundKey && item[foundKey]) return item[foundKey];
                    }
                    return null;
                };

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

        if (!formData.produto) {
            alert('Por favor, selecione um produto da lista.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://vmi3061755.contaboserver.net/webhook/pet-control/venda', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onSuccess(formData);
                onClose();
            } else {
                alert('Erro ao salvar no n8n. Verifique o console.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-purple-50/50">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <User className="text-purple-600" size={24} />
                        Cadastrar Novo Cliente
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Nome do Cliente</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                type="text"
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none"
                                placeholder="Ex: Aldair Antonio"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Telefone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    required
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none"
                                    placeholder="51988887777"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">Pet</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none"
                                placeholder="Ex: Bulldog"
                                value={formData.pet}
                                onChange={(e) => setFormData({ ...formData, pet: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Searchable Product Select */}
                    <div className="space-y-1 relative">
                        <label className="text-sm font-semibold text-slate-700">Produto</label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                type="text"
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none transition-all ${!formData.produto && searchTerm ? 'border-amber-300' : 'border-slate-200'}`}
                                placeholder="Pesquisar produto..."
                                value={formData.produto ? formData.produto : searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setFormData({ ...formData, produto: '' });
                                    setShowProductList(true);
                                }}
                                onFocus={() => setShowProductList(true)}
                            />
                            {showProductList && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map(product => (
                                            <button
                                                key={product.id}
                                                type="button"
                                                className="w-full text-left px-4 py-2 hover:bg-purple-50 flex items-center justify-between border-b border-slate-50 last:border-0"
                                                onClick={() => {
                                                    setFormData({ ...formData, produto: product.nome });
                                                    setSearchTerm('');
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
                        {formData.produto && (
                            <div className="absolute right-3 top-9 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                Selecionado
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Data da Venda</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                required
                                type="date"
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 outline-none"
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
                            disabled={loading || (!formData.produto && searchTerm)}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClientModal;
