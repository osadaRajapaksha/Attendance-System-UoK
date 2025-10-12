const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// simple health
app.get('/health', (req, res) => res.send('ok'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast incoming valid location messages to all connected clients
wss.on('connection', (ws, req) => {
  console.log('WS client connected');
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data && data.user_id && typeof data.lat === 'number' && typeof data.lon === 'number') {
        const out = JSON.stringify({ type: 'location', payload: data });
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) client.send(out);
        });
      }
    } catch (e) {
      console.error('Invalid message', e);
    }
  });

  ws.on('close', () => {
    console.log('WS client disconnected');
  });
});

// Use PORT from environment (Render provides it)
const PORT = parseInt(process.env.PORT || '3000', 10);
server.listen(PORT, '0.0.0.0', () => {
  console.log('Server listening on port', PORT);
});
