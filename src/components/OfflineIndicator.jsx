import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';

/**
 * Componente para gerenciar status offline/online
 * Mostra notificação quando usuário fica offline
 */
const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Detectar mudanças de conexão
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 animate-in slide-in-from-top fade-in duration-300 ${
      isOnline 
        ? 'bg-emerald-50 border-emerald-200' 
        : 'bg-amber-50 border-amber-200'
    } border rounded-xl p-4 flex items-center gap-3 max-w-sm shadow-lg`}>
      {isOnline ? (
        <>
          <Wifi className="text-emerald-500" size={18} />
          <div>
            <p className="text-sm font-black text-emerald-700">Você está online!</p>
            <p className="text-xs text-emerald-600">Seus dados foram sincronizados</p>
          </div>
        </>
      ) : (
        <>
          <WifiOff className="text-amber-500 animate-pulse" size={18} />
          <div>
            <p className="text-sm font-black text-amber-700">Você está offline</p>
            <p className="text-xs text-amber-600">App funciona normalmente. Sincronizará ao conectar.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;
