import React, { useState, useEffect } from 'react';
import { Settings, Save, Upload, Trash2, Store, Globe, Type, PawPrint, Zap } from 'lucide-react';
import { api } from '../services/api';
import { motion } from 'framer-motion';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        shop_name: 'PetControl',
        logo_url: '',
        webhook_url: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await api.fetchAppSettings();
            setSettings(data);
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateAppSettings(settings);
            alert('Configurações salvas no Supabase com sucesso! 🎉');
            window.location.reload();
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            alert('Falha ao salvar configurações.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings({ ...settings, logo_url: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto space-y-10"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-[0.2em] text-[10px]">
                    <Settings size={14} fill="currentColor" />
                    Preferências do Sistema
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter text-left">Configurações</h2>
                <p className="text-slate-500 font-medium italic mt-1 text-left">"Personalize a identidade visual e as integrações do seu painel."</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Visual Identity */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                            <h3 className="font-black text-slate-900 flex items-center gap-3">
                                <Store size={20} className="text-amber-500" />
                                Identidade Visual
                            </h3>
                        </div>

                        <div className="p-10 space-y-8">
                            {/* Shop Name */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    <Type size={12} />
                                    Nome do Pet Shop
                                </label>
                                <input
                                    type="text"
                                    value={settings.shop_name}
                                    onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all font-bold text-slate-700"
                                    placeholder="Ex: My Pet Shop"
                                />
                            </div>

                            {/* Logo Upload */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    <Globe size={12} />
                                    Logo do Painel
                                </label>

                                <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 group hover:border-amber-300 transition-colors">
                                    <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center overflow-hidden border border-slate-100 relative group">
                                        {settings.logo_url ? (
                                            <img src={settings.logo_url} alt="Logo Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <PawPrint size={40} className="text-slate-200 group-hover:text-amber-200 transition-colors" />
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-4 flex flex-col items-center sm:items-start text-center sm:text-left">
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                            Recomendamos uma imagem quadrada (PNG ou JPG) de no mínimo 200x200px.
                                        </p>
                                        <div className="flex gap-2">
                                            <label className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-black text-xs cursor-pointer hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 flex items-center gap-2">
                                                <Upload size={14} />
                                                Escolher Foto
                                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                            </label>
                                            {settings.logo_url && (
                                                <button
                                                    onClick={() => setSettings({ ...settings, logo_url: '' })}
                                                    className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API & Webhooks */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/30 font-black text-slate-900 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Zap size={20} className="text-amber-500" fill="currentColor" />
                                Automação & n8n
                            </div>
                            <span className="text-[10px] bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-tighter">Premium</span>
                        </div>

                        <div className="p-10 space-y-6">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Webhook URL (n8n / WhatsApp)
                                </label>
                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={16} />
                                    <input
                                        type="url"
                                        value={settings.webhook_url}
                                        onChange={(e) => setSettings({ ...settings, webhook_url: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all font-mono text-xs text-slate-600"
                                        placeholder="https://sua-instancia.n8n.cloud/webhook/..."
                                    />
                                </div>
                                <p className="text-[10px] font-medium text-slate-400 italic">
                                    Esta URL será chamada automaticamente sempre que uma mensagem precisar ser disparada via WhatsApp.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Info Card */}
                <motion.div variants={itemVariants} className="space-y-8">
                    <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
                        <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                            <PawPrint size={140} fill="currentColor" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                                <Settings className="text-amber-400" size={24} />
                            </div>
                            <h4 className="text-xl font-black mb-4 tracking-tight">Salvar Alterações</h4>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                                Lembre-se que algumas mudanças podem exigir o recarregamento da página para serem aplicadas em todo o painel.
                            </p>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${saving
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20 hover:shadow-amber-500/40'
                                    }`}
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Salvar Agora
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-amber-50 rounded-[32px] border border-amber-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Zap size={14} fill="currentColor" />
                                Status da Conta
                            </h4>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-sm font-black text-amber-900/80 tracking-tight">Assinatura Ativa</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SettingsPage;
