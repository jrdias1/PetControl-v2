import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, PawPrint, Sparkles, ShieldCheck, Heart, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        // Simulação de delay para efeito visual premium
        setTimeout(() => {
            if (password === 'jr@92294269' || password === 'admin123') {
                login({ name: 'Admin' });
                navigate('/');
            } else {
                setError(true);
                setLoading(false);
            }
        }, 800);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <div className="min-h-screen bg-white flex overflow-hidden font-sans selection:bg-amber-100 selection:text-amber-900">
            {/* Esquerda: Hero Section (Inspirado na Foto 1) */}
            <div className="hidden lg:flex lg:w-3/5 bg-slate-900 relative items-center justify-center overflow-hidden">
                {/* Background Patterns */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10"><PawPrint size={100} className="text-white rotate-12" /></div>
                    <div className="absolute bottom-40 right-20"><PawPrint size={140} className="text-white -rotate-12" /></div>
                    <div className="absolute top-1/2 left-1/4"><PawPrint size={60} className="text-white rotate-45" /></div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="relative z-10 text-center px-12"
                >
                    <div className="mb-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                        <Sparkles className="text-amber-400" size={20} />
                        <span className="text-white font-bold tracking-wider text-sm">O MELHOR PARA SEU PET SHOP</span>
                    </div>

                    <h1 className="text-6xl xl:text-7xl font-black text-white leading-tight mb-6">
                        Cuidado que <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 uppercase tracking-tighter">gera fidelidade</span>
                    </h1>

                    <p className="text-slate-300 text-xl max-w-xl mx-auto mb-10 font-medium leading-relaxed">
                        Transforme o pós-venda do seu negócio com agendamentos inteligentes e lembretes automáticos.
                    </p>

                    <div className="grid grid-cols-3 gap-6 text-white/80">
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">+500</div>
                            <div className="text-xs uppercase font-bold tracking-widest text-slate-400">Pets Felizes</div>
                        </div>
                        <div className="w-px h-10 bg-white/20 mx-auto self-center" />
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">100%</div>
                            <div className="text-xs uppercase font-bold tracking-widest text-slate-400">Automático</div>
                        </div>
                    </div>
                </motion.div>

                {/* Decorative Bottom Circle */}
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
            </div>

            {/* Direita: Login Form (Estilo Minimalista Profissional) */}
            <div className="w-full lg:w-2/5 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-20 bg-slate-50">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md"
                >
                    {/* Brand Logo */}
                    <motion.div variants={itemVariants} className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                            <PawPrint className="text-white" size={28} />
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-900 tracking-tight">PetControl</span>
                            <span className="block text-xs font-bold text-amber-600 uppercase tracking-[0.2em] -mt-1">Pós-Venda Inteligente</span>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h2 className="text-4xl font-black text-slate-900 mb-2">Bem-vindo!</h2>
                        <p className="text-slate-500 font-medium mb-10 text-lg italic">"Acesse seu painel administrativo para cuidar dos seus clientes."</p>
                    </motion.div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <motion.div variants={itemVariants} className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Sua Chave de Acesso</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Digite sua senha master"
                                    className={`w-full bg-white border-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/20'} py-4 pl-12 pr-4 rounded-2xl outline-none transition-all shadow-sm font-medium text-lg`}
                                    required
                                />
                            </div>
                            <AnimatePresence>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-red-500 text-sm font-bold flex items-center gap-1 mt-2 ml-1"
                                    >
                                        <ShieldCheck size={16} /> Senha incorreta. Tente novamente.
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-slate-200 hover:bg-black flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Entrar no Painel
                                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-slate-200/50 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Sparkles size={16} /></span>
                            Dica: Use 'admin123' para o acesso de teste.
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-sm font-bold">
                            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Heart size={16} /></span>
                            Suporte exclusivo via WhatsApp: (24) 98137-5213
                        </div>
                    </motion.div>
                </motion.div>

                <div className="mt-auto pt-8 space-y-3">
                    <div className="text-slate-400 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                        <ShieldCheck size={14} /> Ambiente Seguro & Criptografado
                    </div>
                    <div className="text-slate-500 text-xs font-medium italic">
                        Desenvolvido por{' '}
                        <a 
                            href="https://www.instagram.com/essencial_comunicacao/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-amber-600 hover:text-amber-700 font-bold underline transition-colors"
                        >
                            Essencial Comunicação
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
