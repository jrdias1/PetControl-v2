import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Clock, AlertCircle, CheckCircle2, Save, X } from 'lucide-react';
import AddProductModal from '../components/AddProductModal';

const ProductsPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    // Buscar produtos ao carregar a página
    useEffect(() => {
        fetchProducts();
    }, []);

    // Helper para buscar valor independente de maiúsculas/minúsculas/espaços
    const getValue = (item, keys) => {
        const itemKeys = Object.keys(item);
        for (const key of keys) {
            const foundKey = itemKeys.find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
            if (foundKey && item[foundKey]) return item[foundKey];
        }
        return null;
    };

    const fetchProducts = async () => {
        setLoadingList(true);
        try {
            const response = await fetch('https://vmi3061755.contaboserver.net/webhook/pet-control/produtos');
            if (response.ok) {
                const data = await response.json();
                const formattedProducts = data.map((item, index) => ({
                    id: index + 1,
                    nome: getValue(item, ['Termo', 'nome', 'name']) || 'Sem Nome',
                    duracao: getValue(item, ['Duracao', 'duração', 'duration']) || '30',
                    antecedencia: getValue(item, ['Antecedencia', 'antecedência', 'leadTime']) || '5'
                }));
                setProducts(formattedProducts);
            }
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        } finally {
            setLoadingList(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative text-slate-800">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-2">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Produtos</h2>
                    <p className="text-slate-500 text-sm font-medium">Configure os ciclos de vida de cada item.</p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-[18px] font-bold transition-all shadow-xl shadow-slate-200 active:scale-95 text-sm"
                >
                    <Plus size={20} />
                    Novo Produto
                </button>
            </div>

            {/* Product List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white border border-slate-100/80 rounded-[28px] p-7 shadow-sm hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300 group cursor-default">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Package size={24} />
                            </div>
                            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                ID: {product.id}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-1">{product.nome}</h3>

                        <div className="space-y-2 mt-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Clock size={16} className="text-slate-400" />
                                <span>Dura <strong>{product.duracao} dias</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <AlertCircle size={16} className="text-amber-500" />
                                <span>Avisar <strong>{product.antecedencia} dias</strong> antes</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AddProductModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchProducts}
            />
        </div>
    );
};

export default ProductsPage;
