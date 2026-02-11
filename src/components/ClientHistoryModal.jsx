import React from 'react';
import { X, Calendar, Package, User, Phone, ShoppingBag, Heart } from 'lucide-react';

const ClientHistoryModal = ({ isOpen, onClose, client }) => {
    if (!isOpen || !client) return null;

    // Ordenar histórico por data decrescente (mais recente primeiro)
    const sortedHistory = [...(client.history || [])].sort((a, b) => {
        return new Date(b.dataRaw) - new Date(a.dataRaw);
    });

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 relative group flex flex-col max-h-[90vh]">
                {/* Decoration */}
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-amber-50 rounded-full opacity-50 pointer-events-none" />

                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex justify-between items-start bg-amber-50/30 relative z-10">
                    <div className="flex gap-5">
                        <div className="w-16 h-16 rounded-[22px] bg-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-amber-200">
                            {client.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{client.nome}</h3>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Phone size={12} className="text-slate-300" /> {client.telefone}
                                </span>
                                <span className="text-[11px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                    <Heart size={12} fill="currentColor" className="opacity-70" /> {client.pet}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10 scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <ShoppingBag size={16} />
                        </div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Histórico de Compras</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <div className="space-y-4">
                        {sortedHistory.length > 0 ? (
                            sortedHistory.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex gap-5 p-5 rounded-3xl border border-transparent bg-slate-50/50 hover:bg-white hover:border-amber-100 hover:shadow-xl hover:shadow-amber-500/5 transition-all group animate-in slide-in-from-bottom-2"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="p-4 bg-white rounded-2xl text-slate-300 group-hover:text-amber-500 shadow-sm transition-colors border border-slate-100">
                                        <Package size={22} />
                                    </div>
                                    <div className="flex-1 pb-1">
                                        <p className="font-black text-slate-800 text-lg tracking-tight mb-1">{item.produto}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                                                <Calendar size={12} /> {item.data}
                                            </span>
                                            <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
                                                Próximo: {item.proximoContato}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 flex flex-col items-center">
                                <div className="p-5 bg-slate-50 rounded-full mb-4">
                                    <Package size={40} className="text-slate-200" />
                                </div>
                                <p className="text-sm font-bold text-slate-400">Nenhuma compra registrada...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50/80 backdrop-blur-sm border-t border-slate-100 flex justify-end relative z-10">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white text-slate-600 font-black rounded-2xl hover:bg-slate-100 transition-all shadow-sm text-xs uppercase tracking-widest border border-slate-200 active:scale-95"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientHistoryModal;
