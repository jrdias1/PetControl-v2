// Service Worker para PetControl PWA
// Suporta offline, caching inteligente e sincronização em background

const CACHE_NAME = 'petcontrol-v1';
const RUNTIME_CACHE = 'petcontrol-runtime';
const IMAGE_CACHE = 'petcontrol-images';
const API_CACHE = 'petcontrol-api';

// Assets que devem ser cachados na instalação
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/vite.svg'
];

// Instalação: Cache de assets críticos
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando assets críticos');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação: Limpar caches antigas
self.addEventListener('activate', event => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== IMAGE_CACHE && 
              cacheName !== API_CACHE) {
            console.log('[SW] Deletando cache antiga:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de fetch: Cache-First para assets, Network-First para API
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requisições de chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Estratégia por tipo de requisição
  if (request.destination === 'image') {
    // Imagens: cache-first com fallback
    event.respondWith(cacheImage(request));
  } else if (url.hostname === 'gzxalmghhddrtvpwchnj.supabase.co') {
    // API Supabase: network-first com cache fallback
    event.respondWith(cacheAPI(request));
  } else {
    // HTML/JS/CSS: cache-first, fallback para network
    event.respondWith(cacheAssets(request));
  }
});

// Cache estratégias
async function cacheAssets(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    
    // Guardar resposta bem-sucedida
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Offline - usando cache para:', request.url);
    return cache.match(request) || 
           cache.match('/index.html') ||
           new Response('Offline - página não disponível', {
             status: 503,
             statusText: 'Service Unavailable'
           });
  }
}

async function cacheImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    return cache.match(request) || 
           new Response(
             '<svg></svg>',
             { headers: { 'Content-Type': 'image/svg+xml' } }
           );
  }
}

async function cacheAPI(request) {
  // Network-first para API
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] API offline - tentando cache:', request.url);
    const cache = await caches.open(API_CACHE);
    return cache.match(request) || 
           new Response(
             JSON.stringify({ error: 'Offline' }),
             { 
               status: 503,
               headers: { 'Content-Type': 'application/json' }
             }
           );
  }
}

// Background Sync para sincronizar dados quando voltar online
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-sales') {
    event.waitUntil(syncSales());
  } else if (event.tag === 'sync-clients') {
    event.waitUntil(syncClients());
  }
});

async function syncSales() {
  try {
    // Aqui você buscaria dados locais (IndexedDB) e enviaria para Supabase
    console.log('[SW] Sincronizando vendas...');
    // const pendingSales = await getPendingSalesFromIDB();
    // await Promise.all(pendingSales.map(sale => api.registerSale(sale)));
  } catch (error) {
    console.error('[SW] Erro ao sincronizar vendas:', error);
    throw error; // Retry
  }
}

async function syncClients() {
  try {
    console.log('[SW] Sincronizando clientes...');
    // const pendingClients = await getPendingClientsFromIDB();
    // await Promise.all(pendingClients.map(client => api.addClient(client)));
  } catch (error) {
    console.error('[SW] Erro ao sincronizar clientes:', error);
    throw error; // Retry
  }
}

// Push Notifications para lembretes
self.addEventListener('push', event => {
  console.log('[SW] Push notificação recebida');
  
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: data.tag || 'petcontrol-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notificação clicada:', event.action);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Procura janela aberta
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Se não existe, abre nova
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Periodic Background Sync (sincronizar a cada 24h)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'sync-data') {
    console.log('[SW] Sincronização periódica executada');
    event.waitUntil(syncAllData());
  }
});

async function syncAllData() {
  try {
    console.log('[SW] Sincronizando todos dados...');
    // await api.fetchClients();
    // await api.fetchProducts();
    // await api.fetchAgenda();
    // Guardar em IndexedDB para offline
  } catch (error) {
    console.error('[SW] Erro ao sincronizar:', error);
  }
}

// Log de status
console.log('[SW] Service Worker registrado e ativo');
