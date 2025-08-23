const CACHE = 'v1';

const ASSETS = [
  '/',
  '/worker.js',
  '/manifest.json',
  '/icon.svg',
];

const PORT = 8000;

class SyncWorker {
  constructor(state = new Map()) {
    this.websocket = null;
    this.connected = false;
    this.connecting = false;
    this.reconnectTimer = null;
    this.clientId = '';
    this.lastDeltaId = 0;
    this.state = state;
    this.queue = [];
    this.root = null;
    this.init();
  }

  async init() {
    this.state.set('expense', new Map());
    this.state.set('category', new Map());
    this.root = await navigator.storage.getDirectory();
    await this.loadState();
  }

  delivery(packet) {
    if (this.connected) {
      this.send(packet);
    } else {
      this.queue.push(packet);
      this.saveState();
    }
  }

  send(packet) {
    this.websocket.send(JSON.stringify(packet));
  }

  async loadState() {
    if (!this.root) return;
    const file = await this.root.getFileHandle('state.json', { create: true });
    const reader = await file.getFile();
    const data = await reader.text();
    if (!data) return;
    const parsed = JSON.parse(data);
    this.lastDeltaId = parsed.lastDeltaId || 0;
    this.queue = parsed.queue || [];
    this.clientId = parsed.clientId;
    const expenses = parsed.expenses || {};
    for (const [id, expense] of Object.entries(expenses)) {
      this.set('expense', id, expense);
    }
    const categories = parsed.categories || {};
    for (const [id, category] of Object.entries(categories)) {
      this.set('category', id, category);
    }
  }

  async saveState() {
    if (!this.root) return;
    const expenses = {};
    for (const [key, value] of this.state.get('expense').entries()) {
      expenses[key] = value;
    }
    const categories = {};
    for (const [key, value] of this.state.get('category').entries()) {
      categories[key] = value;
    }
    const state = {
      clientId: this.clientId,
      lastDeltaId: this.lastDeltaId,
      queue: this.queue,
      expenses,
      categories,
    };
    const file = await this.root.getFileHandle('state.json', { create: true });
    const writable = await file.createWritable();
    await writable.write(JSON.stringify(state));
    await writable.close();
  }

  applyDelta(records) {
    for (const record of records) {
      this.applyCRDT(record);
    }
    this.saveState();
  }

  applyCRDT(delta) {
    console.log('Applying CRDT delta:', delta);
    const { strategy, entity, record } = delta;
    if (entity === 'expense' && strategy === 'lww') {
      this.set('expense', record.id, record);
    } else if (entity === 'category' && strategy === 'lww') {
      this.set('category', record.id, record);
    }
  }

  async flushQueue() {
    if (!this.connected) return;
    if (!this.queue.length) return;
    for (const packet of this.queue) {
      this.send(packet);
    }
    this.queue = [];
    await this.saveState();
  }

  async clearDatabase() {
    this.state.clear();
    this.state.set('expense', new Map());
    this.state.set('category', new Map());
    this.lastDeltaId = 0;
    this.queue = [];
    await this.saveState();
  }

  set(entity, key, value) {
    this.state.get(entity).set(key, value);
  }
}

const syncWorker = new SyncWorker();

const broadcast = async (packet, exclude) => {
  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
  });
  for (const client of clients) {
    if (client.id !== exclude) {
      console.log('Broadcasting to:', client.id);
      client.postMessage(packet);
    }
  }
};

const updateCache = async () => {
  const cache = await caches.open(CACHE);
  try {
    await cache.addAll(ASSETS);
  } catch (error) {
    console.error('Error updating cache:', error);
  }
};

self.addEventListener('install', (event) => {
  const install = async () => {
    await updateCache();
    await self.skipWaiting();
  };
  event.waitUntil(install());
});

const serveFromCache = async (request) => {
  const cache = await caches.open(CACHE);
  const response = await cache.match(request);
  return response;
};

const fetchFromNetwork = async (request) => {
  const response = await fetch(request);
  if (response.status === 200) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
};

const offlineFallback = async (request) => {
  const cachedResponse = await serveFromCache(request);
  if (cachedResponse) return cachedResponse;
  if (request.mode === 'navigate') {
    const cache = await caches.open(CACHE);
    const fallbackResponse = await cache.match('/index.html');
    if (fallbackResponse) {
      return fallbackResponse;
    }
  }
  return new Response('Offline - Content not available', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' },
  });
};

const cleanupCache = async () => {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames
    .filter((cacheName) => cacheName !== CACHE)
    .map(async (cacheName) => {
      await caches.delete(cacheName);
    });
  await Promise.all(deletePromises);
};

self.addEventListener('fetch', async (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;
  const respond = async () => {
    try {
      const response = await serveFromCache(request);
      if (response) return response;
      return await fetchFromNetwork(request);
    } catch {
      return await offlineFallback(request);
    }
  };
  event.respondWith(respond());
});

const activate = async () => {
  try {
    await Promise.all([cleanupCache(), self.clients.claim()]);
    console.log('Service Worker: Activated successfully');
  } catch (error) {
    console.error('Service Worker: Activation failed:', error);
  }
};

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    (async () => {
      await activate();
      await syncWorker.loadState();
    })(),
  );
});

const connect = async () => {
  console.log('Service Worker: Connecting to WebSocket...');
  if (syncWorker.connected || syncWorker.connecting) return;
  syncWorker.connecting = true;

  const protocol = self.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const url = `${protocol}//${self.location.hostname}:${PORT}`;
  console.log("Connecting to WebSocket:", url);
  syncWorker.websocket = new WebSocket(url);

  syncWorker.websocket.onopen = () => {
    syncWorker.connected = true;
    syncWorker.connecting = false;
    console.log('Service Worker: websocket connected');
    broadcast({ type: 'status', data: { connected: true } });
    const data = { lastDeltaId: syncWorker.lastDeltaId };
    syncWorker.send({ type: 'sync', data });
    syncWorker.flushQueue();
  };

  syncWorker.websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('Service Worker: websocket message:', message);
    const { type, data } = message;
    if (type === 'delta') {
      syncWorker.lastDeltaId += data.length;
      syncWorker.applyDelta(data);
    }
    broadcast(message);
  };

  syncWorker.websocket.onclose = () => {
    console.log('Service Worker: websocket disconnected');
    if (syncWorker.connected) {
      syncWorker.connected = false;
      broadcast({ type: 'status', data: { connected: false } });
    }
    syncWorker.connecting = false;
    if (syncWorker.reconnectTimer) clearTimeout(syncWorker.reconnectTimer);
    syncWorker.reconnectTimer = setTimeout(connect, 3000);
  };
};

const events = {
  connect: (source, data) => {
    syncWorker.clientId = data.clientId;
    source.postMessage({
      type: 'status',
      data: { connected: syncWorker.connected },
    });
    source.postMessage({ type: 'state', data: syncWorker.state });
  },
  online: () => connect(),
  offline: () => {
    if (syncWorker.connected) syncWorker.websocket.close();
  },
  delta: (source, data) => {
    syncWorker.applyDelta(data);
    syncWorker.lastDeltaId += data.length;
    broadcast({ type: 'delta', data }, source.id);
    syncWorker.delivery({ type: 'delta', data });
  },
  ping: (source) => {
    source.postMessage({ type: 'pong' });
  },
  updateCache: async (source) => {
    try {
      await updateCache();
      source.postMessage({ type: 'cacheUpdated' });
    } catch (error) {
      const data = { error: error.message };
      source.postMessage({ type: 'cacheUpdateFailed', data });
    }
  },
  clearDatabase: async (source) => {
    try {
      await syncWorker.clearDatabase();
      console.log("Database cleared", syncWorker.state);
      broadcast({ type: 'state', data: syncWorker.state });
      source.postMessage({ type: 'databaseCleared' });
    } catch (error) {
      const data = { error: error.message };
      source.postMessage({ type: 'databaseClearFailed', data });
    }
  },
};

self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  const handler = events[type];
  if (handler) handler(event.source, data);
});

connect();
