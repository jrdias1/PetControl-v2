import React from 'react';
import { X, Calendar, Package, User, Phone, ShoppingBag } from 'lucide-react';

const ClientHistoryModal = ({ isOpen, onClose, client }) => {
    if (!isOpen || !client) return null;

    // Ordenar histórico por data decrescente (mais recente primeiro)
    const sortedHistory = [...(client.history || [])].sort((a, b) => {
        return new Date(b.dataRaw) - new Date(a.dataRaw);
    });

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-purple-50/50">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-100">
                            {client.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{client.nome}</h3>
                            <div className="flex flex-col gap-1 mt-1">
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Phone size={12} /> {client.telefone}
                                </span>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <User size={12} /> Pet: {client.pet}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2">
                        <ShoppingBag size={18} className="text-purple-600" />
                        Histórico de Compras
                    </div>

                    <div className="space-y-4">
                        {sortedHistory.length > 0 ? (
                            sortedHistory.map((item, index) => (
                                <div key={index} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all group">
                                    <div className="p-3 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                                        <Package size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800">{item.produto}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Calendar size={12} /> {item.data}
                                            </span>
                                            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                                Próximo: {item.proximoContato}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <Package size={40} className="mx-auto mb-2 opacity-20" />
                                Nenhuma compra registrada.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientHistoryModal;
