import React, { useState } from 'react';
import { X, Save, AlertCircle, CheckCircle2, Package, Clock } from 'lucide-react';

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
            const response = await fetch('https://vmi3061755.contaboserver.net/webhook/pet-control/config-produto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setNotification({ type: 'success', message: 'Produto configurado com sucesso!' });
                onSuccess(formData);
                setTimeout(() => {
                    setNotification(null);
                    onClose();
                    setFormData({ nome: '', duracao: '', antecedencia: '5' });
                }, 1500);
            } else {
                throw new Error('Erro ao salvar');
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'Erro ao conectar com o servidor.' });
        } finally {
            setLoading(false);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Package className="text-purple-600" size={20} />
                        Adicionar Novo Produto
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {notification && (
                        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {notification.message}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
                        <input
                            type="text"
                            name="nome"
                            required
                            placeholder="Ex: Simparic 10kg"
                            value={formData.nome}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                <Clock size={14} className="text-slate-400" />
                                Duração (Dias)
                            </label>
                            <input
                                type="number"
                                name="duracao"
                                required
                                placeholder="30"
                                value={formData.duracao}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                                <AlertCircle size={14} className="text-amber-500" />
                                Avisar Antes
                            </label>
                            <input
                                type="number"
                                name="antecedencia"
                                required
                                placeholder="5"
                                value={formData.antecedencia}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-sm transition flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Salvando...' : (
                            <>
                                <Save size={18} />
                                Salvar Configuração
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full bg-white border border-slate-200 text-slate-600 font-semibold py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                    >
                        Cancelar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
