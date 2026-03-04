import {WebSocket, WebSocketServer} from 'ws';

function sendJson(socket,payload){
    if(socket.readyState!==WebSocket.OPEN) return;
            socket.send(JSON.stringify(payload));
    
}

function broadcastjson(wss, payload){
    wss.clients.forEach(client=>{
        if(client.readyState!==WebSocket.OPEN) return;
        client.send(JSON.stringify(payload));
    })}; 


    export function attachWebSocketServer(server){
        const wss=new WebSocketServer({
            server,
            path:'/ws',
            maxPayload:1024*1024, // 1MB

        });

        wss.on('connection', (socket, req)=>{
            console.log('New WebSocket connection from', req.socket.remoteAddress);
            sendJson(socket, { message: 'Welcome to the Sportz WebSocket API!' });
            socket.on('error',console.error);
        });

        function broadcastMatchCreated(match){
            broadcastjson(wss, { type: 'match_created', data: match });
        };
        return { broadcastMatchCreated };
    }
