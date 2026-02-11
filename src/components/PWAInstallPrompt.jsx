import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2 } from 'lucide-react';

/**
 * Componente para gerenciar instalação do PWA
 * Detecta quando pode ser instalado e oferece botão customizado
 */
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iOS);

    // Detectar se está em modo PWA/standalone
    const isInStandaloneMode = () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone === true;
    };

    if (isInStandaloneMode()) {
      console.log('✅ PWA: App já está instalado');
      setIsInstalled(true);
      return;
    }

    console.log('🔍 PWA: Aguardando evento beforeinstallprompt...');
    console.log('📱 PWA: iOS detectado?', iOS);

    // Detectar quando pode fazer install
    const handleBeforeInstallPrompt = (event) => {
      console.log('✅ PWA: beforeinstallprompt disparado!');
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

    // Para iOS, mostrar prompt após 3 segundos se não estiver instalado
    if (iOS && !isInStandaloneMode()) {
      const timer = setTimeout(() => {
        console.log('📱 PWA: Mostrando instruções iOS');
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // Para iOS, mostrar instruções
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      console.log('⚠️ PWA: Nenhum evento de instalação disponível ainda');
      return;
    }

    console.log('🚀 PWA: Iniciando instalação...');
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
    setShowIOSInstructions(false);
    // Guardar no localStorage que o usuário dispensou
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Verificar se usuário já dispensou antes
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed && !isInstalled) {
      // Mostrar novamente após 7 dias
      const dismissedTime = parseInt(dismissed) || Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime > sevenDays) {
        localStorage.removeItem('pwa-prompt-dismissed');
      }
    }
  }, [isInstalled]);

  if (isInstalled) {
    return null;
  }

  // Não mostrar se foi dispensado e não é iOS
  if (!showPrompt && localStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  // Instruções para iOS
  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white">
            <h3 className="font-black text-lg flex items-center gap-2">
              <Smartphone size={20} />
              Como Instalar no iOS
            </h3>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-slate-600 mb-4 font-medium">
              Siga esses passos para adicionar à sua tela inicial:
            </p>

            <ol className="space-y-3 mb-6">
              <li className="flex gap-3 text-sm text-slate-700">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-black text-xs">1</span>
                <span>Toque no botão <Share2 size={14} className="inline mx-1" /> <strong>Compartilhar</strong> na barra inferior do Safari</span>
              </li>
              <li className="flex gap-3 text-sm text-slate-700">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-black text-xs">2</span>
                <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></span>
              </li>
              <li className="flex gap-3 text-sm text-slate-700">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-black text-xs">3</span>
                <span>Confirme tocando em <strong>"Adicionar"</strong></span>
              </li>
            </ol>

            <button
              onClick={handleDismiss}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-3 px-4 rounded-xl transition-colors"
            >
              Entendi!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prompt normal (Android/Desktop)
  if (!showPrompt) {
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
              {isIOS ? 'Ver Instruções' : 'Instalar Agora'}
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
