'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { WebSocketServer } = require('ws');
const { randomUUID } = require('node:crypto');

const PORT = 8000;


class SyncServer {
  constructor(server, ws) {
    this.server = server;
    this.ws = ws;
    this.connections = new Map();
    this.state = new Map();
    this.deltas = [];
    this.dataPath = path.join(process.cwd(), 'data');
    this.dataFile = path.join(this.dataPath, 'data.json');
    return this.#init();
  }

  async #init() {
    await fs.promises.mkdir(this.dataPath, { recursive: true });
    await this.loadData().catch(() => this.saveData());
    return this;
  }

  async loadData() {
    const data = await fs.promises.readFile(this.dataFile, 'utf8');
    const parsed = JSON.parse(data);
    this.state.clear();
    const messages = parsed.messages || {};
    for (const [key, value] of Object.entries(messages)) {
      this.state.set(key, value);
    }
    this.deltas = parsed.deltas || [];
  }

  async saveData() {
    const state = {};
    for (const [key, value] of this.state.entries()) {
      state[key] = value;
    }
    const data = JSON.stringify({ messages: state, deltas: this.deltas });
    await fs.promises.writeFile(this.dataFile, data);
  }

  async applyDelta(delta) {
    this.deltas.push(delta);
    const { strategy, entity, record } = delta;
    if (entity === 'message' && strategy === 'lww') {
      this.state.set(record.id, record);
    }
    if (entity === 'reaction' && strategy === 'counter') {
      const { messageId, reaction } = record;
      const message = this.state.get(messageId);
      if (!message) return;
      if (!message.reactions) message.reactions = {};
      const count = message.reactions[reaction] || 0;
      message.reactions[reaction] = count + 1;
    }
    await this.saveData();
  }

  broadcast(data, excludeId = '') {
    const packet = JSON.stringify(data);
    for (const [clientId, socket] of this.connections) {
      if (clientId === excludeId) continue;
      socket.send(packet);
    }
  }
}

class Session {
  constructor(socket, req, sync) {
    this.socket = socket;
    this.req = req;
    this.sync = sync;
    this.clientId = randomUUID();
    this.initialize();
  }

  post(data) {
    this.socket.send(JSON.stringify(data));
  }

  async message(packet) {
    const msg = packet.toString();
    console.log(`Received from ${this.clientId}:`, msg);
    const message = JSON.parse(msg);
    const { type, data } = message;
    if (type === 'ping') {
      this.post({ type: 'pong' });
    } else if (type === 'sync') {
      const deltas = this.sync.deltas.slice(data.lastDeltaId);
      if (deltas.length > 0) this.post({ type: 'delta', data: deltas });
    } else if (type === 'delta') {
      for (const delta of data) {
        await this.sync.applyDelta(delta);
      }
      this.sync.broadcast(packet, this.clientId);
    }
  }

  close() {
    console.log(`WebSocket connection closed: ${this.clientId}`);
    this.sync.connections.delete(this.clientId);
  }

  error(error) {
    console.error(`WebSocket error for ${this.clientId}:`, error);
    this.sync.connections.delete(this.clientId);
  }

  initialize() {
    this.sync.connections.set(this.clientId, this.socket);
    const data = { clientId: this.clientId };
    this.post({ type: 'connected', data });
    const ip = this.req.socket.remoteAddress;
    console.log(`Client connected: ${this.clientId} from ${ip}`);
  }
}

const startServer = async () => {
  const server = http.createServer();
  const ws = new WebSocketServer({ server });
  const sync = await new SyncServer(server, ws);

  process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    for (const socket of sync.connections.values()) {
      socket.close();
    }
    sync.connections.clear();
    ws.close(() => {
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  });

  ws.on('connection', (socket, req) => {
    const session = new Session(socket, req, sync);
    socket.on('message', (packet) => session.message(packet));
    socket.on('close', () => session.close());
    socket.on('error', (error) => session.error(error));
  });

  server.listen(PORT, () => {
    console.log(`PWA Server running at http://127.0.0.1:${PORT}/`);
  });
};

startServer();
