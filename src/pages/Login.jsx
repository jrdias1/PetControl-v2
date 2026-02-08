import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, PawPrint, ArrowRight } from 'lucide-react';

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') {
            localStorage.setItem('petcontrol_auth', 'true');
            navigate('/');
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-purple-50 to-slate-50 z-0" />

            <div className="bg-white p-8 md:p-10 rounded-3xl w-full max-w-sm shadow-xl shadow-slate-200/50 relative z-10 border border-slate-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/30 transform -rotate-6 mb-4">
                        <PawPrint className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">PetControl</h2>
                    <p className="text-slate-500 text-sm">Acesse sua gestão inteligente</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-2 pl-1">Senha de Acesso</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm text-center bg-red-50 py-2 rounded-lg border border-red-100 animate-pulse font-medium">
                            Senha incorreta.
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-purple-600/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Entrar no Sistema
                        <ArrowRight size={18} />
                    </button>
                </form>
            </div>

            <p className="text-center text-slate-400 text-xs mt-8 relative z-10 font-medium">
                © 2026 PetControl System • Versão 2.0
            </p>
        </div>
    );
};

export default Login;
