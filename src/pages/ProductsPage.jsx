import React, { useState, useEffect } from 'react';
import { Plus, Package, Clock, AlertCircle, Trash2, PawPrint, Zap } from 'lucide-react';
import AddProductModal from '../components/AddProductModal';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const ProductsPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoadingList(true);
        try {
            const data = await api.fetchProducts();
            setProducts(data);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        } finally {
            setLoadingList(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;

        try {
            await api.deleteProduct(id);
            fetchProducts();
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.02 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 1, scale: 1, y: 0 },
        visible: { opacity: 1, scale: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-10"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between lg:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                        <Package size={14} fill="currentColor" />
                        Catálogo de Itens
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Produtos</h2>
                    <p className="text-slate-500 font-medium italic mt-1">"Gerencie o ciclo de vida e a recorrência dos seus produtos."</p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-amber-200 active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    Novo Produto
                </button>
            </motion.div>

            {/* Product List */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.length === 0 && !loadingList ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-huge flex items-center justify-center mx-auto mb-4 grayscale opacity-50">
                            <Package size={40} className="text-slate-400" />
                        </div>
                        <p className="text-xl font-black text-slate-300 tracking-tight">Vazio por aqui...</p>
                        <p className="text-slate-400 text-sm mt-2 font-medium">Cadastre seu primeiro produto para começar!</p>
                    </div>
                ) : products.map((product) => (
                    <motion.div
                        key={product.id}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="bg-white border border-slate-100 rounded-huge p-8 shadow-xl shadow-slate-200/40 group relative overflow-hidden"
                    >
                        {/* Status Decoration */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all shadow-lg shadow-amber-100 group-hover:shadow-amber-200">
                                <Package size={28} />
                            </div>
                            <button
                                onClick={() => handleDelete(product.id)}
                                className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight group-hover:text-amber-600 transition-colors">{product.nome || 'Sem Nome'}</h3>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">
                                    {product.id ? `SKU-00${String(product.id).substring(0, 4)}` : 'PROD-NEW'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                                    <Clock size={16} className="text-emerald-500 mb-2" />
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Duração</div>
                                    <div className="text-sm font-black text-slate-900">{product.duracao} dias</div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                                    <Zap size={16} className="text-amber-500 mb-2" fill="currentColor" />
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Antecedência</div>
                                    <div className="text-sm font-black text-slate-900">{product.antecedencia} dias</div>
                                </div>
                            </div>
                        </div>

                        {/* Pet Paw Print Decoration */}
                        <div className="absolute bottom-4 right-4 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <PawPrint size={60} fill="currentColor" />
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <AddProductModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchProducts}
            />
        </motion.div>
    );
};

export default ProductsPage;
