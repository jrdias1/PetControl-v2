import React, { useState } from 'react';
import { X, Save, AlertCircle, CheckCircle2, Package, Clock, PawPrint } from 'lucide-react';
import { api } from '../services/api';

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [formData, setFormData] = useState({
        nome: '',
        duracao: '',
        antecedencia: '5'
    });

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const success = await api.addProduct(formData);

            if (success) {
                setNotification({ type: 'success', message: 'Produto configurado!' });
                onSuccess(formData);
                setTimeout(() => {
                    setNotification(null);
                    onClose();
                    setFormData({ nome: '', duracao: '', antecedencia: '5' });
                }, 1000);
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'Erro ao salvar produto.' });
        } finally {
            setLoading(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 relative group">
                {/* Decoration */}
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-amber-50 rounded-full opacity-50 pointer-events-none" />

                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-amber-50/30 relative z-10">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white text-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                            <Package size={22} fill="currentColor" className="opacity-70" />
                        </div>
                        Configurar Produto
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 relative z-10">
                    {notification && (
                        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}>
                            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            {notification.message}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Descrição do Produto</label>
                        <div className="relative">
                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                name="nome"
                                required
                                placeholder="Ex: Simparic 10-20kg"
                                value={formData.nome}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 outline-none transition-all font-bold text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Duração (Dias)</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="number"
                                    name="duracao"
                                    required
                                    placeholder="30"
                                    value={formData.duracao}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 outline-none transition-all font-bold text-slate-700"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Lead Time (Aviso)</label>
                            <div className="relative">
                                <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/50" size={18} />
                                <input
                                    type="number"
                                    name="antecedencia"
                                    required
                                    placeholder="5"
                                    value={formData.antecedencia}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-amber-200 outline-none transition-all font-bold text-slate-700"
                                />
                            </div>
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
                            disabled={loading}
                            className="flex-[2] py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-300 shadow-xl shadow-amber-100 active:scale-95 group"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                                <>
                                    <span>Salvar Produto</span>
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

export default AddProductModal;
