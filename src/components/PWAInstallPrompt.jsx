import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

/**
 * Componente para gerenciar instalação do PWA
 * Detecta quando pode ser instalado e oferece botão customizado
 */
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar se está em modo PWA/standalone
    const isInStandaloneMode = () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone === true;
    };

    if (isInStandaloneMode()) {
      setIsInstalled(true);
      return;
    }

    // Detectar quando pode fazer install
    const handleBeforeInstallPrompt = (event) => {
      // Previne o prompt automático do navegador
      event.preventDefault();
      // Guarda o evento para usar depois
      setDeferredPrompt(event);
      // Mostra nosso UI customizado
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA instalado com sucesso!');
      setShowPrompt(false);
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Mostra o prompt de instalação
    deferredPrompt.prompt();
    
    // Espera usuário responder
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Usuário aceitou instalar PWA');
      setShowPrompt(false);
    } else {
      console.log('❌ Usuário recusou instalar PWA');
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-w-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white">
          <h3 className="font-black text-lg flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            Instalar PetControl
          </h3>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-slate-600 mb-4 font-medium">
            Acesse o app diretamente da sua tela inicial sem abrir o navegador. Funciona offline!
          </p>

          {/* Features */}
          <ul className="space-y-2 mb-4 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <span className="text-amber-500">✓</span>
              Acesso rápido na tela inicial
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-500">✓</span>
              Funciona sem internet
            </li>
            <li className="flex items-center gap-2">
              <span className="text-amber-500">✓</span>
              Carrega mais rápido
            </li>
          </ul>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black py-2 px-4 rounded-xl transition-colors active:scale-95 flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Instalar Agora
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
