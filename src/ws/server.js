import { WebSocket, WebSocketServer } from 'ws';
import { wsArcjet } from '../arcjet.js';

function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function broadcastjson(wss, payload) {
  wss.clients.forEach(client => {
    if (client.readyState !== WebSocket.OPEN) return;
    client.send(JSON.stringify(payload));
  });
}

// heartbeat function
function heartbeat() {
  this.isAlive = true;
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: '/ws',
    maxPayload: 1024 * 1024 // 1MB
  });

  wss.on('connection', async(socket, req) => {

    if(wsArcjet){
        try {
            const decision =await wsArcjet.protect(req);
            if(decision.isDenied()){
                const code=decision.reason.isRateLimit() ? 1013 : 1008;
                const reason=decision.reason.isRateLimit() ? 'Rate limit exceeded.Too many requests' : 'Acccess denied by Arcjet';
               socket.close(code, reason);
                return;
            }   
            
        } catch (error) {
            console.error('Arcjet WebSocket protection error', error);
            socket.close(1011, 'Internal server error during Arcjet protection');
            return;
            
        }
    }
    console.log('New WebSocket connection from', req.socket.remoteAddress);

    socket.isAlive = true;

    sendJson(socket, {
      message: 'Welcome to the Sportz WebSocket API!'
    });

    socket.on('pong', heartbeat);

    socket.on('error', console.error);
  });

  // ping interval
  const interval = setInterval(() => {
    wss.clients.forEach(socket => {
      if (socket.isAlive === false) {
        console.log("Terminating dead connection");
        return socket.terminate();
      }

      socket.isAlive = false;
      socket.ping();
      
    });
  }, 30000); // 30 seconds

  wss.on('close', () => {
    clearInterval(interval);
  });

  function broadcastMatchCreated(match) {
    broadcastjson(wss, {
      type: 'match_created',
      data: match
    });
  }

  return { broadcastMatchCreated };
}